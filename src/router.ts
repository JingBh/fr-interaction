import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { useStore } from './store.ts'
import PageNotFound from './pages/PageNotFound.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/control',
    component: () => import('./pages/PageControl.vue')
  },
  {
    path: '/join',
    component: () => import('./pages/PageGame.vue'),
    beforeEnter: () => {
      const store = useStore()
      if (!store.userGroup) {
        return {
          path: '/join/group'
        }
      }
    }
  },
  {
    path: '/join/group',
    component: () => import('./pages/PageSelectGroup.vue')
  },
  {
    path: '/presentation',
    component: () => import('./pages/PagePresentation.vue'),
    props: (route) => ({
      question: route.query.question,
      chart: route.query.chart
    })
  },
  {
    path: '/presentation/result',
    component: () => import('./pages/PagePresentationResult.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    component: PageNotFound
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
