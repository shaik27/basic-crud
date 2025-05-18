const express = require('express')
const fs = require('fs')
let app = express()
let moviesData = JSON.parse(fs.readFileSync('./data/movies.json'))

//middleware
app.use(express.json())

//get
app.get('/api/v1/movies', (req, res) => {
    // res.status(200).send("hello world")
    let resData = {
        status: 'success',
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
    if(foundData){
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

//post
app.post('/api/v1/movies', (req, res) => {
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
    let index = moviesData.findIndex(movie=>movie.id === idVal)
    if(index === -1){
        return res.status(404).json({
            status: 'failed',
            msg: `No movie with the id ${idVal} is found`
        })
    }
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
app.delete('/api/v1/movies/:id', (req,res)=>{
    let idVal = +req.params.id
    let index = moviesData.findIndex(movie=>movie.id === idVal)
    let deletedData = moviesData[index]
    if(index === -1){
        return res.status(404).json({
            status: 'failed',
            msg: `No movie with the id ${idVal} is found`
        })
    }
    moviesData.splice(index,1)
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

app.listen(3001, () => {
    console.log('server has started');
})