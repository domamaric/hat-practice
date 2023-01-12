"""Module for custom receiver adapter.

Adapter supports two-way communication, towards frontend (``hat-gui``) 
and backend (``hat-event``) servers.

Notes
-----
Do not forget to setup PYTHONPATH, but not to override the current.
Usage ``$ export PYTHONPATH=$PYTHONPATH:src_py``.

"""

from hat.aio import Group
from hat.util import CallbackRegistry

import hat.event.common as ec
import hat.gui.common as gc


# Initialize JSON shema to None, as it is not required property
json_schema_id = None
json_schema_repo = None


async def create_subscription(conf):
    r"""Provide message event subscription onto ``hat-event`` server.

    Returns
    -------
    `hat.event.common.Subscription`
        Subscription to message event.

    """
    return ec.Subscription([('message',)])


async def create_adapter(conf, event_client):
    r"""Creates custom adapter instance.

    Method is used as constructor, which takes `conf` to specity adapter
    configuration. But it is easier to hardcode default values since this
    is dummy version.

    Parameters
    ----------
    conf : JSON object
        JSON like adapter configuration. Defaults to `None`.
    event_client : 
        Link to event server client.

    Returns
    -------
    `hat.gui.common.Adapter`
        New adapter instance.
    """
    adapter = Adapter()

    adapter._async_group = Group()
    adapter._event_client = event_client
    adapter._state = []
    adapter._state_change_cb_registry = CallbackRegistry()

    adapter._async_group.spawn(adapter._main_loop)
    return adapter


class Adapter(gc.Adapter):
    r"""Instance of `hat.gui.common.Adapter`.

    Adapter constantly runs main loop which initially runs data query
    to fetch stored messages. Afterwards, register received messages and
    notify frontend.

    Attributes
    ----------
    async_group
    state : list
        Current adapter state

    Methods
    -------
    subscribe_to_state_change(callback)
        Create subscription on callback.
    create_session(juggler_client)
        Create new adapter's single juggler connection.
    send_message_text(text_message)
        Register event on event server.

    """
    @property
    def async_group(self):
        return self._async_group

    @property
    def state(self):
        return self._state

    def subscribe_to_state_change(self, callback):
        r"""Register callback to trigger state chage."""
        return self._state_change_cb_registry.register(callback)

    async def create_session(self, juggler_client):
        r"""Create new juggler connection session in adapters's group."""
        return Session(self, juggler_client, self._async_group.create_subgroup())

    async def _main_loop(self):
        r"""Fetch from backend and register messages to frontend."""
        history = await self._event_client.query(
            ec.QueryData(event_types=[('message', )],
                             order_by=ec.OrderBy.TIMESTAMP,
                             order=ec.Order.ASCENDING)
        )
        text_history = list(map(lambda x: x.payload.data, history))
        self._state = self._state + text_history  # Append history to state

        while True:
            events = await self._event_client.receive()
            for event in events:
                self._state = self._state + [event.payload.data]
                self._state_change_cb_registry.notify()

    def send_message_text(self, text_message):
        r"""Store message text by sending it to ``hat-event`` server."""
        self._event_client.register([ec.RegisterEvent(event_type=('message',),
                                    source_timestamp=ec.now(),
                                    payload=ec.EventPayload(
                                        type=ec.EventPayloadType.JSON,
                                        data=text_message))])


class Session(gc.AdapterSession):
    r"""Instance of juggler client session.

    Session spawns initial message log onto frontend. Afterwards wait
    for user's input, than propagate it to adapter for satoring in
    database.

    Attributes
    ----------
    adapter
        Adapter instance.
    juggler_client
        Juggler connection session client.
    group
        Adapter asnyc group for task querying.

    """

    def __init__(self, adapter, juggler_client, group):
        self._adapter = adapter
        self._juggler_client = juggler_client
        self._async_group = group
        self._async_group.spawn(self._run)

    @property
    def async_group(self):
        return self._async_group

    async def _run(self):
        r"""Provides message log and connection to adapter."""
        try:
            self._message_received()  # Necessary for initial chat log
            with self._adapter.subscribe_to_state_change(self._message_received):
                while True:
                    msg = await self._juggler_client.receive()
                    self._adapter.send_message_text(msg)

        except Exception as e:
            await self.wait_closing()

    def _message_received(self):
        r"""Provide adapter's state to frontend."""
        self._juggler_client.set_local_data(self._adapter._state)
