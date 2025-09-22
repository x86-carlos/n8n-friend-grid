import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions
} from 'n8n-workflow';

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
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'friendGridApi',
				required: true,
			},
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
				displayOptions: {
					show: {
						resource: [
							'contact',
						],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
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
				default: {},
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
						default: ' ',
					},
				],
			},

		], //fim properties
	}; //fim descrição

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;
		const returnData = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for(let i = 0; i < items.length; i++) {
			if(resource === 'contact') {
				if(operation === 'create') {
					const email = this.getNodeParameter('email', i) as string;
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					const data: IDataObject = {
						email,
					};

					Object.assign(data, additionalFields);

					const options = {
						headers: {
							'Accept': 'application/json',
						},
						body: {
							contacts: [
								data,
							],
						},
						uri: `https://api.sendgrid.com/v3/marketing/contacts`,
						json: true,
					};

					try {
						responseData = await this.helpers.requestWithAuthentication.call(this, 'friendGridApi', options);
						returnData.push(responseData);
					} catch(error) {
						throw new Error(`SendGrid API error: ${error.message}`);
					}
				}
			}
		}
		return [this.helpers.returnJsonArray(returnData)];
	} //fim função execute
} // fim classe
