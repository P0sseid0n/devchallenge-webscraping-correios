const puppeteer = require('puppeteer')


const CEP = '20540330'


;(async () => {
    if(isNaN(CEP)) return console.log('CEP invalido')
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],
        headless: true
    })
    
    const page = await browser.newPage()

    await page.setRequestInterception(true)
    page.on('request', req => {
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image' || req.resourceType() == 'javascript') req.abort()
        else req.continue()
    })
    
    await page.goto('https://buscacepinter.correios.com.br/app/endereco/index.php')
    
    await page.focus('#endereco')
    page.keyboard.type(CEP)
    await page.waitForTimeout(50)
    await page.click('#btn_pesquisar')
    
    await page.waitForTimeout(200)
    const info = await page.evaluate(() => {
        const infos = []
        let info = []
        
        ;[...document.querySelectorAll('#resultado-DNEC td')].forEach((td, index) => {
            info.push(td.innerText)            
            if((index + 1) % 4 == 0){
                infos.push(info)
                info = []
            }
        })
        return infos
    })

    console.log(info)
    
    await browser.close();
    
})()