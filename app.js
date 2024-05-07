const express = require('express')
const web = express()
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
web.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')
const db = null

const initializeDbAndServer = async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    web.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`)
    })
  } catch (e) {
    console.log(`Error ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const stateDbObjectToResponseObj = dbObject => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  }
}

const districtDbObjectToResponse = dbObject => {
  return {
    districtId: dbObject.district_id,
    districttName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  }
}

//Get all States
web.get('/states/', async (request, response) => {
  const GetAllStatesQuery = `
    SELECT * FROM state ORDER BY state_id
    `
  const GetAllStatesArray = await db.all(GetAllStatesQuery)
  response.send(
    GetAllStatesArray.map(state => stateDbObjectToResponseObj(state)),
  )
})

//Get state by id
web.get('/states/:stateId', async (request, response) => {
  const {stateId} = request.params
  const getStateById = `
  SELECT * FROM states WHERE state_id=${stateId}
  `
  const stateArray = await db.get(getStateById)
  response.send(stateDbObjectToResponseObj(stateArray))
})
//insert district into table
web.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const createDistrictQuery = `
    INSERT INTO district(district_name,state_id,cases,cured,active,deaths) 
    VALUES 
    (${districtName},${stateId},${cases},${cured},${active},${deaths})
    `
  await db.run(createDistrictQuery)
  reponse.send(`District Successfully Added`)
})
module.exports = web
