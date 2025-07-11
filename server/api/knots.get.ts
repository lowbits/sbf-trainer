import knotsData from '~~/server/assets/data/knots.json'


export default defineEventHandler(() => {
    return knotsData.map((knot: any) => {
        const validatedKnot = knotSchema.parse(knot)

        // Transform asset paths to API paths
        if (validatedKnot.image.startsWith('~/assets/images/')) {
            return {
                ...validatedKnot,
                image: validatedKnot.image.replace('~/assets/images/', '/api/images/')
            }
        }

        return validatedKnot
    })
})
