const express = require('express')
const morgan = require('morgan')
const fs = require('fs')
let app = express()
let moviesData = JSON.parse(fs.readFileSync('./data/movies.json'))

const logger = (req, res, next) => {
    console.log('logger ');
    req.requestedAt = new Date().toISOString()
    req.requestedBy = 'Meharaj'
    next()
}
//middleware
app.use(express.json())
//morgan middleware to get the info about api, loadtime etc
app.use(morgan('dev'))
//custom
app.use(logger)

const checkId = (req, res, next) => {

}
//param MW where it checks for all the id params to reduce the duplicate code
app.param('id', (req, res, next) => {
    let idVal = +req.params.id
    let index = moviesData.findIndex(movie => movie.id === idVal)
    if (index === -1) {
        return res.status(404).json({
            status: 'failed',
            msg: `No movie with the id ${idVal} is found`
        })
    }
    next()
})

//get
app.get('/api/v1/movies', (req, res) => {
    // res.status(200).send("hello world")
    let resData = {
        status: 'success',
        requestedAt: req.requestedAt,
        requestedBy: req.requestedBy,
        count: moviesData?.length,
        data: {
            moviesData: moviesData
        }
    }
    res.status(200).json(resData)
})

//get by id
app.get('/api/v1/movies/:id', (req, res) => {
    let idVal = +req.params.id
    let foundData = moviesData?.find(movie => movie.id === idVal)
    let objData = {
        statusMsg: 'failed',
        statusCode: 404
    }
    if (foundData) {
        objData.statusMsg = 'success'
        objData.statusCode = 200
    }
    let resData = {
        status: objData?.statusMsg,
        data: {
            movie: foundData
        }
    }
    res.status(objData?.statusCode).json(resData)
})

//Validate middleware
const validateBody = (req, res, next) => {
    if (!req?.body?.name) {
        return res.status(400).json({ msg: 'No proper data found' })
    }
    next()
}

//post with validateBody middleware
app.post('/api/v1/movies', validateBody, (req, res) => {
    let newId = moviesData[moviesData.length - 1].id + 1
    let newMovie = {
        id: newId,
        ...req.body
    }
    moviesData.push(newMovie)
    fs.writeFile('./data/movies.json', JSON.stringify(moviesData), (err) => {
        let resData = {
            status: 'success',
            data: {
                movie: newMovie
            }
        }
        res.status(201).json(resData)
    })
})

//Put
app.put('/api/v1/movies/:id', (req, res) => {
    let idVal = +req.params.id
    let index = moviesData.findIndex(movie => movie.id === idVal)
    // if (index === -1) {
    //     return res.status(404).json({
    //         status: 'failed',
    //         msg: `No movie with the id ${idVal} is found`
    //     })
    // }
    moviesData[index] = {
        ...moviesData[index],
        ...req.body
    }
    fs.writeFile('./data/movies.json', JSON.stringify(moviesData), (err) => {
        let resData = {
            status: 'success',
            data: {
                movie: moviesData[index]
            }
        }
        res.status(200).json(resData)
    })
})

//delete
app.delete('/api/v1/movies/:id', (req, res) => {
    let idVal = +req.params.id
    let index = moviesData.findIndex(movie => movie.id === idVal)
    let deletedData = moviesData[index]
    // if (index === -1) {
    //     return res.status(404).json({
    //         status: 'failed',
    //         msg: `No movie with the id ${idVal} is found`
    //     })
    // }
    moviesData.splice(index, 1)
    fs.writeFile('./data/movies.json', JSON.stringify(moviesData), (err) => {
        let resData = {
            status: 'success',
            data: {
                movie: deletedData
            }
        }
        res.status(200).json(resData)
    })
})

const port = 3001
app.listen(port, () => {
    console.log('server has started on port ', port);
})