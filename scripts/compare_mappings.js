/** This Node Script will compare two Airtable Mapping to check if items are missing */

const fs = require("fs")
const path = require('path')

const {
    getFilesNames,
    inverTextColor,
    query
} = require('./utils')

const options = []

function getCompareMapping() {
    let question = '\nWhat file would you like to compare?\n'
    const fileNames = getFilesNames('./frontend/mappings/', ['definition.json'])
    if(fileNames) {
        question += inverTextColor('Options:\n')
        question += fileNames + '\n'
    }
    query(question, (response) => {
        const files = fileNames.split('\n')
        if(response && !isNaN(response)) {
            const index = Number(response) - 1
            if(files[index]) {
                options[0] = files[index].substring(files[index].indexOf(' ') + 1) + '.mappings.json'
            } else {
                console.log('ERROR: invalid option')
                process.kill()
            }
        } else {
            if(fileNames.includes(response + '.mappings.json')) {
                options[0] = response + '.mappings.json'
            } else {
                console.log('ERROR: invalid response: ' + response)
                process.exit(1)
            }
        }
        runProcess()
    })
}

function getDefinitionMapping() {
    let question = '\nWhat file should be used for comparission? ( Default: development )\n'
    const fileNames = getFilesNames('./frontend/mappings/', ['definition.json', options[0]])
    if(fileNames) {
        question += inverTextColor('Options:\n')
        question += fileNames + '\n'
    }
    query(question, (response) => {
        const files = fileNames.split('\n')
        if(response && !isNaN(response)) {
            const index = Number(response) - 1
            if(files[index]) {
                options[1] = files[index].substring(files[index].indexOf(' ') + 1) + '.mappings.json'
            } else {
                console.log('ERROR: invalid option')
                process.kill()
            }
        } else {
            if(fileNames.includes(response + '.mappings.json')) {
                options[1] = response + '.mappings.json'
            } else {
                options[1] = 'development.mappings.json'
            }
        }
        runProcess()
    })
}



function compareMappings() {
    /** Get Files */
	const definition = JSON.parse(fs.readFileSync('./frontend/mappings/' + options[0]))
	const compare = JSON.parse(fs.readFileSync('./frontend/mappings/' + options[1]))
    
    console.log('Files Found.. Comparing..')
	const defTablesKeys = {}
    
    /** Get tables */
    Object.keys(definition.tables).forEach(key => {
		defTablesKeys[definition.tables[key]] = key;
	});
    
    const tableErrors = Object.keys(definition.tables).filter(k => !compare.tables[k]).map(k => `Expected to have table ${k}`)
    
    const mappingErrors = definition.mappings.map(mapGroup => {
		const key = Object.keys(mapGroup)[0]
		const valid = compare.mappings.find(mapG => Object.keys(mapG)[0] === key)
		if(!valid) {
			const maps = mapGroup[key].filter(map => map.fieldId)
			let missingGroup = '\nTables ' + maps.map(map => defTablesKeys[map.tableId]).join(', ')
			missingGroup += `\n Are missing map group ( key ) ${key}. \n Recomended type - ${maps[0].fieldType}`
			return missingGroup
		}
		return mapGroup[key].map((map, i) => {
			const validMap = valid[key][i]
			if(!validMap) return `${key} is missing ${map.tableId} - index ${i}`
			if(!validMap.tableId) return `Expected table ${map.tableId} for index ${i}, got ${validMap.tableId}`
			if(map.fieldId) {
				if(!validMap.fieldId || !validMap.fieldName || !validMap.fieldType) {
					return `Expected ${defTablesKeys[map.tableId]} ( ${map.tableId} ) field ${key} to have a field id, name, type ( Recomended ${map.fieldType} )`
				}
			}
		})
	}).flat().filter(error => error).sort()
	if(mappingErrors.length && mappingErrors[0].indexOf('\nTables') === 0) {
		mappingErrors.unshift(inverTextColor('\n\r* Map Group Errors *'))
	}
	const mapErrorStart = mappingErrors.findIndex(e => e.indexOf('Expected') === 0)
	if(mapErrorStart !== -1) mappingErrors.splice(mapErrorStart, 0, inverTextColor('\n\r* Map Errors *'))

	if(tableErrors.length || mappingErrors.length) {
		console.log('Compare Complete - There where Errors\n\r')
        console.log(`-- Compared ${options[0]} to ${options[1]} --`)
        console.log(inverTextColor('\n* Table Errors *\n'))
		tableErrors.map(e => console.log(e))
		mappingErrors.map(e => console.log(e))
	} else {
		console.log('Compare Complete - No Errors')
    }
    process.exit(0)
}


function runProcess() {
    switch(options.length) {
        case 0: // Only ran file
            getCompareMapping()
            break
        case 1: // 
            getDefinitionMapping()
            break
        case 2:
            compareMappings()
            break
        default:
            console.log('Invalid number of arguments')
            process.exit(1)
    }
}

process.argv.splice(0, 2)
process.argv.map((opt, i) => options[i] = opt)

runProcess()
