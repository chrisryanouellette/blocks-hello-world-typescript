import { DefineBlock, Body, NotificationCenter, Header, Navigation, Main } from '@ouellettec/airtable_elements'
import { Colors, Mappings, Base } from '@ouellettec/airtable_helpers'
import { initializeBlock, useBase } from '@airtable/blocks/ui'
import { useState } from 'react'
import React from 'react'
import pkg from '../package.json'

const BLOCK_ID = ''
const MAIN_PAGE = ''

function HelloWorldBlock () {

	const base = useBase() as Base
	const [nav, setnav] = useState(MAIN_PAGE)
	
	return (
		<DefineBlock blockId={BLOCK_ID} authors={pkg.authors} version={pkg.version}>
			<Body backgroundColor={Colors.merlot}>
				<NotificationCenter>
					<Header>SOme Header</Header>
					<Navigation 
						value={nav}
						onClick={(location: string) => setnav(location)}
						items={[{
							id: '',
							name: '',
						}]}
					/>
					<Main>
						
					</Main>
				</NotificationCenter>
			</Body>
		</DefineBlock>
	)
}

initializeBlock(() => <HelloWorldBlock />)
