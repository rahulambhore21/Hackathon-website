const ALLOWED_HOST = ['localhost', '127.0.0.1', "192.168.20.238"];

const DATABASES = {
    default: {
        ENGINE: 'django.db.backends.sqlite3',
        NAME: 'sqlite3',
        LOCATION: "./src/models/database/database.db"
    }
};

const DATABASES_1 = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '',
    }
}

const INSTALLED_APPS = [
    
]

const MIDDLEWARE = [
    
]

const STATIC_URL = '/static/'
const MEDIA_URL = '/media/'

const configs = {
    debug: true,
    allowed_host: ALLOWED_HOST,
    database_property_1: DATABASES,
    database_property_2: DATABASES_1,
    installed_apps: INSTALLED_APPS,
    middleware: MIDDLEWARE,
    static_url: STATIC_URL,
    media_url: MEDIA_URL,
    PORT:3000,
}

const trigger_Error = (mes) => {
    if (configs.debug) {
        console.log(mes)
    }
}

module.exports = {
    configs,
    trigger_Error,
}