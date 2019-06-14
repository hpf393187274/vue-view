export default [
  { path: '/layout/table', component: () => import( /* webpackChunkName: "example-layout" */ '@docs/layout/table.md') },
  { path: '/layout/paging', component: () => import( /* webpackChunkName: "example-layout" */ '@docs/layout/paging.md') },
  { path: '/layout/tree', component: () => import( /* webpa ckChunkName: "example-layout" */'@docs/layout/tree.md') },
  { path: '/layout/transfer', component: () => import( /* webpackChunkName: "example-layout" */ '@docs/layout/transfer.md') }
]