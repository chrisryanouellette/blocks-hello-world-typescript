import { globalConfig } from '@airtable/blocks'
import { initializeBlock, useBase } from '@airtable/blocks/ui'
import {
	DefineBlock,
	Body,
	NotificationCenter,
	Header,
	Navigation,
	Main
} from '@ouellettec/airtable_elements'
import {
	Colors,
	Base
} from '@ouellettec/airtable_helpers'
import { useState } from 'react'
import React from 'react'

import pkg from '../package.json'

const BLOCK_ID = ''
const MAIN_PAGE = ''

function HelloWorldBlock () {

	const base = useBase() as Base
	const [nav, setnav] = useState(MAIN_PAGE)
	const [loading, setloading] = useState(false)
	
	return (
		<DefineBlock blockId={BLOCK_ID} authors={pkg.authors} version={pkg.version} globalConfig={globalConfig}>
			<Body backgroundColor={Colors.merlot}>
				<NotificationCenter>
					<Header>Some Header</Header>
					<Navigation 
						value={nav}
						onClick={(location: string) => setnav(location)}
						items={[{
							id: '',
							name: '',
						}]}
						loading={loading}
					/>
					<Main>
						
					</Main>
				</NotificationCenter>
			</Body>
		</DefineBlock>
	)
}

initializeBlock(() => <HelloWorldBlock />)
