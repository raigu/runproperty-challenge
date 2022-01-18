import fetch from 'node-fetch'

async function fetchAuthorizationCode() {
    let response = await fetch('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/start', {
        method: 'POST',
        body: JSON.stringify({
            name: 'raigu',
            email: 'raigur@gmail.com'
        })
    })
    let data = await response.json()
    return data.authorizationCode
}

async function fetchStatus(code) {
    let response = await fetch(`https://warp-regulator-bd7q33crqa-lz.a.run.app/api/status?authorizationCode=${code}`)
    return await response.json()
}

async function adjustMatter(code, value) {
    console.log(`Adjusting matter by ${value}...`)
    await fetch('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/adjust/matter', {
        method: 'POST',
        body: JSON.stringify({
            authorizationCode: code,
            value: value,
        }),
        headers: {'Content-Type': 'application/json'}
    })
}

async function adjustAntiMatter(code, value) {
    console.log(`Adjusting antimatter by ${value}...`)
    await fetch('https://warp-regulator-bd7q33crqa-lz.a.run.app/api/adjust/antimatter', {
        method: 'POST',
        body: JSON.stringify({
            authorizationCode: code,
            value: value,
        }),
        headers: {'Content-Type': 'application/json'}
    })
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log('Starting...')
    let code = await fetchAuthorizationCode()
    console.log('Authorization code', code)

    let i = 0
    let step = 0.08
    while (true) {
        i++
        let status = await fetchStatus(code)
        console.log(`${i}: `, status)

        if (status.intermix < 0.5) {
            // more antimatter
            step = 0.5 - status.intermix
            if (status.flowRate === 'LOW') {
                adjustMatter(code, step)
            } else if (status.flowRate === 'HIGH') {
                adjustAntiMatter(code, -step)
            } else {
                adjustAntiMatter(-0.01)
            }
        } else if (status.intermix > 0.5) {
            // more matter
            step = status.intermix - 0.5
            if (status.flowRate === 'LOW') {
                adjustAntiMatter(code, step)
            } else if (status.flowRate === 'HIGH') {
                adjustMatter(code, -step)
            } else {
                adjustMatter(code, -0.01)
            }
        } else {
            if (status.flowRate === 'HIGH') {
                adjustMatter(code, -0.1)
                adjustAntiMatter(code, -0.1)
            } else if (status.flowRate === 'LOW') {
                adjustMatter(code, 0.1)
                adjustAntiMatter(code, 0.1)
            }
        }


        await timeout(1000)
    }
}

main()
