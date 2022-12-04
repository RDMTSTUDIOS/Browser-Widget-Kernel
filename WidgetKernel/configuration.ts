
export const CONFIGURATION = {
    system: {
        development: true,
    },
}

export const DEV_TOOLS = {
    logValues([...values]) {
        values.forEach((value)=>console.log(value))
    }
}

