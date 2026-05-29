import { getSession } from './api.js';

const session = getSession();

if (!session?.user) {

```
window.location.replace('/login.html');
```

}

document
.getElementById('customerBtn')
?.addEventListener('click', () => {

```
    localStorage.setItem(
        'activeRole',
        'Customer'
    );

    window.location.replace('/');

});
```

document
.getElementById('vendorBtn')
?.addEventListener('click', () => {

```
    localStorage.setItem(
        'activeRole',
        'Vendor'
    );

    window.location.replace(
        '/vendor-dashboard.html'
    );

});
```
