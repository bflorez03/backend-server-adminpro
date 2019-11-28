exports.getMenu = function (userRole) {
    var menu = [
        {
            title: 'Main',
            icon: 'mdi mdi-gauge',
            subMenu: [
                { title: 'Dashboard', url: '/dashboard' },
                { title: 'ProgressBar', url: '/progress' },
                { title: 'Graphs', url: '/graphs1' },
                { title: 'Promises', url: '/promises' },
                { title: 'Rxjs', url: '/rxjs' }
            ]
        },
        {
            title: 'Maintenance',
            icon: 'mdi mdi-account-settings-variant',
            subMenu: [
                //{ title: 'Users', url: '/users' },
                { title: 'Doctors', url: '/doctors' },
                { title: 'Hospitals', url: '/hospitals' }
            ]
        }
    ];

    if (userRole === 'ADMIN_ROLE') {
        menu[1].subMenu.unshift({ title: 'Users', url: '/users' });
    }

    return menu;
};