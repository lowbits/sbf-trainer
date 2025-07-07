export default defineNuxtRouteMiddleware((to) => {
    const userToken = useCookie('sbf_user_token')

    if (to.path === '/' && !userToken.value) {
        return navigateTo('/welcome')
    }
})
