/** This Node Script will compare two Airtable Mapping to check if items are missing */


function compareMappings() {
	const fs = require('fs')
	let defScriptName, compareScriptName
	let definition, compare
	if(process.argv.length === 4) {
		defScriptName = process.argv[2]
		compareScriptName = process.argv[3]
		definition = JSON.parse(fs.readFileSync('./frontend/mappings/' + defScriptName + '.mappings.json'))
		compare = JSON.parse(fs.readFileSync('./frontend/mappings/' + compareScriptName + '.mappings.json'))
	} else {
		defScriptName = 'development'
		compareScriptName = process.argv[2]
		definition = JSON.parse(fs.readFileSync('./frontend/mappings/development.mappings.json'))
		compare = JSON.parse(fs.readFileSync('./frontend/mappings/' + process.argv[2] + '.mappings.json'))
	}

	console.log('Files Found.. Comparing..')
	const defTablesKeys = {}
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
		mappingErrors.unshift('\n\r* Map Group Errors *')
	}
	const mapErrorStart = mappingErrors.findIndex(e => e.indexOf('Expected') === 0)
	if(mapErrorStart !== -1) mappingErrors.splice(mapErrorStart, 0, '\n\r* Map Errors *')

	if(tableErrors.length || mappingErrors.length) {
		console.log('Compare Complete - There where Errors\n\r')
		console.log(`-- Compared ${defScriptName} to ${compareScriptName} --`)
		tableErrors.map(e => console.log(e))
		mappingErrors.map(e => console.log(e))
	} else {
		console.log('Compare Complete - No Errors')
	}
}


if(process.argv.length < 3) {
	console.log('To compare mappings, enter the name of the JSON file in the ./frontend/mappings/ folder you wish to compare.')
} else {
	compareMappings()
}
