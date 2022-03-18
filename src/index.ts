import express, { Request, Response } from 'express'
import * as path from 'path'
import fetch from 'node-fetch'
import { engine as handlebars } from 'express-handlebars'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.set('views', path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, '../assets')));

app.engine('hbs', handlebars({
layoutsDir: __dirname + '/../views/layouts',
extname: 'hbs',
defaultLayout: 'main',
}));

app.set('view engine', 'hbs');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.all('/', async (req: Request, res: Response) => {

    let zip:string = req.body.zipSearch

    let geo: object = {
        'zip': '',
        'city': ''
    }

    if(zip) {

        const geoCords = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${zip}&appid=1a484c62c6c1d0a3cf1bdda4903204da`)
        const cords = await geoCords.json()
    
        geo = {
            'zip': zip,
            'city': cords.name
        }

    } else {
        let remoteIP: any = req.header('x-forwarded-for') || req.connection.remoteAddress; 
    
        if(remoteIP == '127.0.0.1' || remoteIP == '::1') {
             remoteIP = '4.2.2.2'
        }

         const geoIP = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IPGEOLOCATION_API_KEY}&ip=${remoteIP}`)
         const ipInfo = await geoIP.json()

         zip = ipInfo.zipcode || '' 
	 geo = {
            'zip': zip.split('-')[0],
            'city': ipInfo.city
        }

	if(zip) {

        const geoCords = await fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${geo.zip}&appid=${process.env.OPENWEATHERMAP_API_KEY}`)
        const cords = await geoCords.json()
	} else {
	    const cords = {
		    'lat': ipInfo.latitude,
		    'lon': ipInfo.longitude
	    }
	}
    }

    const weatherApi = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cords.lat}&lon=${cords.lon}&units=imperial&appid=1a484c62c6c1d0a3cf1bdda4903204da`)
    const data = await weatherApi.json()
    
    res.render('page/index', {
        data: data,
        geo: geo,
        helpers: {
            dow(timeStamp: any) { 

                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']; 
                const dayNum = new Date(timeStamp * 1000).getDay()
                return days[dayNum]; 
            },
            fomattedDate(timeStamp: any) { 

                const convertedDate = new Date(timeStamp * 1000)
                return `${convertedDate.getMonth()} / ${convertedDate.getDate()}`; 
            },
            sevenday(daily: any, options: any) {
                const today = daily.shift()

                if(today.rain) {
                    options.data.root['precipitation'] = (today.rain * 100)
                } else if (today.snow) {
                    options.data.root['precipitation'] = (today.snow * 100)
                } else {
                    options.data.root['precipitation'] = 0
                }

                options.data.root['sevenDayForecast'] = daily
            }
        }
    });
})


app.listen(process.env.APP_PORT, () => {
    console.log('The application is listening on port 4000!')
})
