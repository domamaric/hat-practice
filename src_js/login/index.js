import r from '@hat-open/renderer';
import * as u from '@hat-open/util';

import 'main.scss';


export function init() {
    r.set('view', { username: '', password: '' });
}


export function vt() {
    return ['div.main rotate-center',
        ['label', { class: { 'input-label': true } },
            'Username'
        ],
        ['input', {
            attrs: { id: 'username', class: 'input-field' },
            on: { change: evt => r.set(['view', 'username'], evt.target.value) }
        }
        ],
        ['label', { class: { 'input-label': true } },
            'Password'
        ],
        ['input', {
            attrs: { type: 'password', id: 'password', class: 'input-field' },
            on: {
                change: evt => r.set(['view', 'password'], evt.target.value),
                keydown: key => {
                    if (key.key === "Enter")
                        hat.conn.login(r.get('view', 'username'), key.target.value)
                }
            }
        }
        ],
        ['button', {
            attrs: { id: 'login', class: 'login' },
            on: {
                click: () => hat.conn.login(r.get('view', 'username'), r.get('view', 'password'))
            }
        },
            'Login'
        ]
    ]
}


window.r = r;
window.u = u;