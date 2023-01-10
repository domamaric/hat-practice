import r from '@hat-open/renderer';
import * as u from '@hat-open/util';

import 'main.scss';
import 'chat.scss';


function clear_message() {
    let msg_field = document.getElementById('message');
    msg_field.value = "";
    r.set(['view', 'message'], "")
}


function generate_chat_menu() {
    return ['div.disp-chat.col-flex',
        ['h1.title', 'ŠtaIma'],
        ['div.disp-window.col-flex',
            ['div', {
                attrs: {
                    class: 'msg-window scrollable',
                    id: 'msg-window'
                }
            }, fetch_messages()
            ]
        ],
        ['div.typing.row-flex',
            ['input', {
                attrs: {
                    type: 'text',
                    id: 'message',
                    class: 'input-text',
                    placeholder: 'Type message...'
                },
                on: {
                    change: evt => r.set(['view', 'message'], evt.target.value),
                    keydown: key => {
                        if (key.key === "Enter" && key.target.value !== "") {
                            let payload = { 'user': hat.user, 'message': key.target.value }
                            hat.conn.send('server', payload);

                            clear_message();
                        }
                        scroll_bottom();
                    }
                }
            }
            ],
            ['button.send', {
                on: {
                    click: (evt) => {
                        if (r.get(['view', 'message']) !== "") {
                            // Clear input message buffer input and local var
                            let payload = { 'user': hat.user, 'message': r.get(['view', 'message']) }
                            hat.conn.send('server', payload);

                            clear_message();
                        }
                        scroll_bottom();
                    }
                }
            }, 'Pošalji'
            ]
        ]
    ]
}

function generate_main_menu() {
    return ['div.container.row-flex.main-background',
        ['div.disp-info.col-flex',
            ['h1.title', 'ŠtaIma'],
            ['div.show-chat',
                ['button.send', {
                    on: {
                        click: () => {
                            r.set(['view', 'current_view'], 'chat-view');
                        }
                    }
                }, 'Pokreni razgovor']
            ],
            ['div.col-flex.width-84',
                ['h3', 'Jednostavna chat aplikacija'],
                ['div.app-brief',
                    'Culpa qui quis excepteur laborum aliquip sit velit. Id fugiat non ex Lorem ipsum. Non voluptate laborum aliquip do anim minim ea. Pariatur et sint cupidatat velit veniam ullamco id exercitation do qui. ',
                    ['br'],
                    'Non aliqua sint est commodo adipisicing veniam ipsum nulla irure in magna duis. Ex tempor laboris nostrud ut fugiat velit eiusmod aliquip labore. Amet irure id est nulla velit aliqua exercitation elit ullamco consequat. Consequat quis mollit exercitation sunt cupidatat incididunt sit occaecat nostrud qui. ',
                    ['br'],
                    'Anim elit nulla sint eu. Et id eiusmod est dolore velit ullamco sit ea laborum eiusmod quis sunt voluptate cupidatat. Laboris irure velit et est officia nostrud exercitation dolore elit excepteur amet.',
                    ['h4', 'Copyright © Made by Me!']
                ]
            ]
        ]
    ];
}


function scroll_bottom() {
    var elem = document.getElementById('msg-window');
    if (elem !== null) {
        elem.scrollTop = elem.scrollHeight;
    }
}


function fetch_messages() {
    let messages = r.get(['remote', 'server']);

    if (messages !== undefined) {
        return messages.map(function (m) {
            if (m.user === r.get(['view', 'user'])) {
                return ['div.message',
                    ['div.message-field position-right',
                        ['div.message-user', m.user],
                        ['div.message-text', m.message]
                    ]
                ]
            } else {
                return ['div.message',
                    ['div.message-field position-left',
                        ['div.message-user', m.user],
                        ['div.message-text', m.message]
                    ]
                ]
            }
        })
    }
}


export function init() {
    r.set('view', { message: '', current_view: 'main-menu', user: hat.user });
}


export function vt() {
    if (r.get(['view', 'current_view']) == 'main-menu') {
        return generate_main_menu()
    } else {
        return generate_chat_menu()
    }
}

window.addEventListener(onafterprint, scroll_bottom())
window.r = r;
window.u = u;