import {consola} from "consola";

export default defineNuxtRouteMiddleware(() => {

    console.log(import.meta)
    if (import.meta.dev) {
        consola.warn('⚠️  DEVELOPMENT-ONLY PAGE ⚠️');
        consola.info('This page will return 404 in production.');
        consola.box('Remove the "development" middleware when ready for production!');
    }


    if (!import.meta.dev) {
        throw createError({statusCode: 404, statusMessage: 'Page Not Found'})
    }
})
