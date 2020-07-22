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
		question += inverTextColor('Options:') + '\n'
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
		question += inverTextColor('Options:') + '\n'
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


function logErrors(errors){
	console.log(`\n-- Compared ${options[0]} to ${options[1]} --`)
	errors.map(err => console.log(err))
}


function compareMappings() {
	/** Get Files */
	const definition = JSON.parse(fs.readFileSync('./frontend/mappings/' + options[1]))
	const compare = JSON.parse(fs.readFileSync('./frontend/mappings/' + options[0]))
	
	console.log('Files Found.. Comparing..')
	const defTablesKeys = {}
	
	/** Get tables */
	Object.keys(definition.tables).forEach(key => {
		defTablesKeys[definition.tables[key]] = key;
	});
	
	/** Find missing tables */
	const tableErrors = Object.keys(definition.tables).filter(k => !compare.tables[k]).map(k => `Expected to have table ${k}`)
	if(tableErrors.length) {
		tableErrors.unshift('\n' + inverTextColor('* Table Errors *') + '\n') 
		logErrors(tableErrors)
		return process.exit(0)
	}

	const missingGroups = []
	const mappingErrors = []

	definition.mappings.forEach(mapGroup => {
		const key = Object.keys(mapGroup)[0]
		const valid = compare.mappings.find(mapG => Object.keys(mapG)[0] === key)
		/** Missing entire group */
		if(!valid) {
			const maps = mapGroup[key].filter(map => map.fieldId)
			let missingGroup;
			if(maps.length === mapGroup[key].length) {
				missingGroup = `Missing group ${key} \n Missing in Tables\t- All`
			} else {
				missingGroup = `Missing group ${key}\n` + ' Missing in Tables\t- '
					+ maps.map(map => defTablesKeys[map.tableId]).join(', ')
			}
			missingGroup += `\n Recomended Type\t- ${maps[0].fieldType}`
			return missingGroups.push(missingGroup)
		}
		/** Check for missing items */
		mapGroup[key].forEach((map, i) => {
			const validMap = valid[key][i]
			if(!validMap) return `${key} is missing ${map.tableId} - index ${i}`
			if(!validMap.tableId) return `Expected table ${map.tableId} for index ${i}, got ${validMap.tableId}`
			/** Missing item in group */
			if(map.fieldId) {
				if(!validMap.fieldId || !validMap.fieldName || !validMap.fieldType) {
					mappingErrors.push(`Expected ${defTablesKeys[map.tableId]} ( ${map.tableId} ) field ${key} to have a field id, name, type ( Recomended ${map.fieldType} )`)
				}
			}
		})
	})
	if(missingGroups.length) {
		missingGroups.unshift('\n\r' + inverTextColor('* Map Group Errors *') + '\n')
		logErrors(missingGroups)
	}
	if(mappingErrors.length) {
		mappingErrors.unshift('\n\r' + inverTextColor('* Map Errors *') + '\n')
		logErrors(mappingErrors)
	}
	
	if(!missingGroups.length && !mappingErrors.length) console.log('Compare Complete - No Errors')
	process.exit(0)
}



function runProcess() {
	switch(options.length) {
		case 0: // Only ran file
			getCompareMapping()
			break
		case 1: // Ran with compare script
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
