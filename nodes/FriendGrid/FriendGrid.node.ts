import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions
} from 'n8n-workflow';

import axios from 'axios';

export class FriendGrid implements INodeType {
	description: INodeTypeDescription = {
		displayName:'FriendGrid',
		name: 'friendGrid',
		icon: 'file:sendGrid.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume SendGridApi',
		defaults: {
			name: 'friendGrid',
		},
		input: ['main'],
		output: ['main'],
		credentials: [
			name: 'friendGridApi',
			required: true,
		],

		properties: [
			//Definir um recurso de API que o conector irá utilizar.
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Contact',
						value: 'Contact',
					},	
				],
				default: 'contact',
				noDataExpression: true,
				required: true,
				description: 'Create a new Contact',
			},

			//Definir uma operação POST para criar um contato
			{
				displayName: 'Opeartion',
				name: 'operation',
				type: 'options',
				displayOpetions: {
					show: {
						resource: [
							'contact',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create,
						description: 'Create a new contact',
						action: 'Create a new contact',
					},
				],
				default: 'create',
				noDataExpression: true,
			},

			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				required: true,
				displayOptions:{
					show: {
						operation: [
							'create',
						],
						resource: [
							'contact',	
						],
					},
				},
				default: '',
				placeholder: 'name@email.com',
				description: 'Email for the contact',
			},
			
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Fields',
				defaults: {},
				displayOptions: {
					show: {
						resource: [
							'contact',
						],
						operation: [
							'create',
						],
					},
				},

				options: [
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						default: ' ',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						defaults: ' ',
					},
				],
			},

		], //fim properties
	}; //fim descrição

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resources = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for(let i = 0; i < items.length; i++) {
			if(resource === 'contact') {
				if(operation === 'create') {
					const additionalFileds = this.getNodeParameter('additionalFields', i) as IDataObject;
					const data: IDataObject = {
						email,
					};

					Object.assign(data, additionalFields);

					const axiosOptions = {
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						method: 'put',
						data: {
							contacts: [
								data,
							],
						},
						url: `https://api.sendgrid.com/v3/marketing/contacts`,
					};

					try {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', axiosOptions);
						returnData.push(responseData);
					} catch {
						throw new Error(`SendGrid API error: ${error.message}`);
					}
				}
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	} //fim função execute
} // fim classe
