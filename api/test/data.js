const Mock = require('./mock')
const Config = require('../src/config')

module.exports = {
  Application: {
    default: true,
    create: {
      name: 'New Application',
    },
    created: {
      id: 1,
      active: true,
      createdAt: Mock.date
    },
    update: {
      name: 'New Application Name'
    },
    updated: {
      updatedAt: Mock.date
    },
    delete: {
      name: 'Application to delete',
      active: false
    }
  },
  Config: {
    default: true,
    initial: [
      {
        id: 'loginUrl',
        value: Config.guiHost + '/login/'
      },
      {
        id: 'passwordUrl',
        value: Config.guiHost + '/password-change/'
      }
    ],
    create: {
      id: 'fakeUrl',
      value: 'http://api.logcentral.gigabase.com.br/fake'
    },
    created: {
      createdAt: Mock.date
    },
    update: {
      value: 'http://api.logcentral.gigabase.com.br/fake2'
    },
    updated: {
      updatedAt: Mock.date
    },
    delete: {
      id: 'toDelete',
      value: 'http://api.logcentral.gigabase.com.br/fake3'
    }
  },
  Environment: {
    default: true,
    create: {
      label: 'Test'
    },
    created: {
      id: 1,
      createdAt: Mock.date
    },
    update: {
      label: 'Production'
    },
    updated: {
      updatedAt: Mock.date
    },
    delete: {
      label: 'Test to delete'
    }
  },
  Level: {
    default: true,
    create: {
      label: 'Warning',
    },
    created: {
      id: 1,
      createdAt: Mock.date
    },
    update: {
      label: 'Error'
    },
    updated: {
      updatedAt: Mock.date
    },
    delete: {
      label: 'Warning to delete'
    }
  },
  Method: {
    default: true,
    create: {
      label: 'GET'
    },
    created: {
      id: 1,
      createdAt: Mock.date
    },
    update: {
      label: 'PUT',
    },
    updated: {
      updatedAt: Mock.date
    },
    delete: {
      label: 'GET to delete'
    }
  },
  User: {
    create: {
      name: 'New User',
      email: 'client1@azul.dev',
      password: 'password',
    },
    created: {
      id: 1,
      name: 'New User',
      email: 'client1@azul.dev',
      active: true,
      createdAt: Mock.date
    },
    delete: {
      name: 'New User to delete',
      email: 'client2@azul.dev',
      password: 'password'
    },
    update: {
      name: 'New User Name',
    },
    updated: {
      updatedAt: Mock.date
    }
  },
  Log: {
    create: {
      application: {
        id: 1
      },
      environment: {
        id: 1
      },
      method: {
        id: 1
      },
      level: {
        id: 1
      },
      sourceAddress: 'localhost',
      datetime: Mock.date,
      url: 'localhost/app',
      message: 'Warning message',
      data: {
        details: 'Warning details'
      }
    },
    created: {
      id: 1,
      url: 'localhost/app',
      message: 'Warning message',
      data: {
        details: 'Warning details'
      },
      datetime: Mock.date,
      sourceAddress: 'localhost',
      localDatetime: Mock.date,
      archived: false,
      createdAt: Mock.date,
      updatedAt: Mock.date,
      application: {
        id: 1,
        name: 'New Application Name'
      },
      method: {
        id: 1,
        label: 'PUT'
      },
      level: {
        id: 1,
        label: 'Error'
      },
      user: {
        id: 1,
        name: 'New User Name',
        email: 'client1@azul.dev'
      },
      environment: {
        id: 1,
        label: 'Production'
      }
    },
    delete: {
      application: {
        id: 1
      },
      environment: {
        id: 1
      },
      method: {
        id: 1
      },
      level: {
        id: 1
      },
      user: {
        id: 1
      },
      sourceAddress: 'localhost',
      datetime: Mock.date,
      url: 'localhost/app',
      message: 'Warning message',
      data: {
        details: 'Warning details'
      }
    },
    updated: {
      updatedAt: Mock.date
    }
  }
}
