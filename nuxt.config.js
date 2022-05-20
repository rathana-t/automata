export default {
    // Global page headers: https://go.nuxtjs.dev/config-head

    target: 'static',

    publicRuntimeConfig: {
        axios: {
            baseURL: 'http://127.0.0.1:8000/api'
        }
    },

    head: {
        title: 'Project_Automata',
        htmlAttrs: {
            lang: 'en'
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
            {
                rel: 'stylesheet',
                href: '../../assets/css/style.css'
            },
        ],
        script: [{
            type: 'module',
            src: '../../assets/js/script.js'
        }]
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        '@/assets/css/style.css'
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [{
        src: '~/plugins/primevue.js',
        // src: '~/plugins/mermaid.js',
        // src: "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
        // src: "https://cdnjs.cloudflare.com/ajax/libs/dagre-d3/0.6.4/dagre-d3.min.js",
        // src: "https://cdnjs.cloudflare.com/ajax/libs/d3/5.15.0/d3.min.js",
        // src: "https://cdn.jsdelivr.net/npm/tipsy-1a@1.0.0/src/javascripts/jquery.tipsy.min.js",
        // src: '~/assets/js/script.js',
    }],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
        // https://go.nuxtjs.dev/tailwindcss
        '@nuxtjs/tailwindcss',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: ['primevue/nuxt'],
    primevue: {
        theme: 'md-light-indigo',
        ripple: true,
        components: [
            'DataTable',
            'Column',
            'InputText',
            'Button',
            'Dialog',
            'Dropdown',
            'Checkbox',
            'RadioButton',
            'Panel',
            'Calendar',
            'SelectButton',
            'Textarea',
            'Fieldset',
            'Tooltip',
            'InputNumber',
            'SpeedDial',
            'Toast',
            'Paginator',
            'MultiSelect',
            'ProgressBar',
            'Password',
            'ProgressSpinner',
        ],
        directives: ['Tooltip', 'Badge']
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
        transpile: ['primevue']
    }
}