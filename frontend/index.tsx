import { initializeBlock } from '@airtable/blocks/ui'
import React from 'react'
import pkg from '../package.json'

function HelloWorldBlock () {
	
	return <div>Hello world</div>
}

initializeBlock(() => <HelloWorldBlock />)
