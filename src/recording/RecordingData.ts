export interface IProperty {
	type: string;
	name: string;
	value: any;
}

export interface IPropertyGroup {
	type: string;
	name: string;
	value: IProperty[];
}

export interface IEvent {
	name: string;
	tag: string;
	properties: IPropertyGroup;
}

export interface IEntity {
	id: number;
	groupMap?: any;
	properties: IProperty[];
	events: IEvent[];
}

export interface IFrameEntityData {
	[key:number]: IEntity
}

export interface IFrameData {
	entities: IFrameEntityData
}

export class PropertyTable {
	types: any[];
	names: string[];
	parentIDs: number[];
	size: number;
	
	constructor() {
		this.types = [];
		this.names = [];
		this.parentIDs = [];
		this.size = 0;
	}
	
	// You need to know your parent ID in order to register an entry
	registerEntry(type : any, name : string, parentID : number) {
		
		const entryID = this.findEntryID(type, name, parentID);
		if (entryID == -1)
		{
			this.types.push(type);
			this.names.push(name);
			this.parentIDs.push(parentID);
			this.size++;
			
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(type : any, name : string, parentID : number) : number {
		for (let i=0; i<this.size; i++) {
			if (this.names[i] == name && this.parentIDs[i] == parentID && this.types[i] == type) {
				return i;
			}
		}
		
		return -1;
	}
}

export class ValueTable {
	values: any[];
	size: number;
	constructor() {
		this.values = [];
		this.size = 0;
	}
	
	registerEntry(value : any) {
		
		const entryID = this.findEntryID(value);
		if (entryID == -1) {
			this.values.push(value);
			this.size++;
			
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(value : any) : number {
		for (let i=0; i<this.size; i++) {
			if (this.values[i] == value) { // TODO: This doesn't support complex types (like vectors, or any object)
				return i;
			}
		}
		
		return -1;
	}
}

export class PropertyValueTable {
	propertyIDs: number[];
	valueIDs: number[];
	size: number;
	constructor() {
		this.propertyIDs = [];
		this.valueIDs = [];
		this.size = 0;
	}
	
	registerEntry(propertyID : number, valueID : number) : number {
		
		const entryID = this.findEntryID(propertyID, valueID);
		if (entryID == -1) {
			this.propertyIDs.push(propertyID);
			this.valueIDs.push(valueID);
			this.size++;
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(propertyID : number, valueID : number) : number {
		for (let i=0; i<this.size; i++) {
			if (this.propertyIDs[i] == propertyID && this.valueIDs[i] == valueID) {
				return i;
			}
		}
		
		return -1;
	}
}

export class EntityPropertyValueTable {
	propValueIDs: number[];
	entityIDs: number[];
	size: number;
	constructor() {
		this.propValueIDs = [];
		this.entityIDs = [];
		this.size = 0;
	}
	
	registerEntry(propValueID : number, entityID : number) : number {
		
		const entryID = this.findEntryID(propValueID, entityID);
		if (entryID == -1) {
			this.propValueIDs.push(propValueID);
			this.entityIDs.push(entityID);
			this.size++;
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(propValueID : number, entityID : number) : number {
		for (let i=0; i<this.size; i++) {
			if (this.propValueIDs[i] == propValueID && this.entityIDs[i] == entityID) {
				return i;
			}
		}
		
		return -1;
	}
}

export class EventDescriptorTable {
	names: string[];
	tags: string[];
	size: number;

	constructor() {
		this.names = [];
		this.tags = [];
		this.size = 0;
	}
	
	registerEntry(name : string, tag : string) : number {
		
		const entryID = this.findEntryID(name, tag);
		if (entryID == -1) {
			this.names.push(name);
			this.tags.push(tag);
			this.size++;
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(name : string, tag : string) : number {
		for (let i=0; i<this.size; i++) {
			if (this.names[i] == name && this.tags[i] == tag) {
				return i;
			}
		}
		
		return -1;
	}
}

export class EventTable {
	descriptorIDs: number[];
	propValueIDs: number[];
	entityIDs: number[];
	size: number;

	constructor() {
		this.descriptorIDs = [];
		this.propValueIDs = [];
		this.entityIDs = [];
		this.size = 0;
	}
	
	registerEntry(descriptorID : number, propValueID : number, entityID : number) : number {
		
		const entryID = this.findEntryID(descriptorID, propValueID, entityID);
		if (entryID == -1) {
			this.descriptorIDs.push(descriptorID);
			this.propValueIDs.push(propValueID);
			this.entityIDs.push(entityID);
			this.size++;
			return this.size - 1;
		}
		
		return entryID;
	}
	
	findEntryID(descriptorID : number, propValueID : number, entityID : number) : number {
		for (let i=0; i<this.size; i++) {
			if (this.descriptorIDs[i] == descriptorID && this.propValueIDs[i] == propValueID && this.entityIDs[i] == entityID) {
				return i;
			}
		}
		
		return -1;
	}
}

export class FrameTable {
	entryIDs: any[];
	size: number;
	constructor() {
		this.entryIDs = []; // Array of arrays
		this.size = 0;
	}
	
	registerEntry(entryID : number, frame : number) : number {
		if (!this.entryIDs[frame])
		{
			this.entryIDs[frame] = [];
		}
		
		this.entryIDs[frame].push(entryID);
		this.size++;
		
		return this.size;
	}
}

export class NaiveRecordedData {
	frameData: IFrameData[];

	constructor() {
		this.frameData = [];
	}

	static getEntityName(entity: IEntity) : string
	{
		// Name is always part of the special groups
		return entity.properties[1].value[0].value;
	}

	addProperties(frame: number, entity : IEntity) {
		if (!this.frameData[frame])
		{
			this.frameData[frame] = { entities: [] };
		}

		this.frameData[frame].entities[entity.id] = entity;
	}

	buildFrameData(frame : number) : IFrameData {
		return this.frameData[frame];
	}

	getSize()
	{
		return this.frameData.length;
	}

	addTestData() {
		for (let i=0; i<100; ++i)
		{
			const frame = i;
			
			for (let j=0; j<15; ++j)
			{
				const entityID = j + 1;

				var entity : IEntity = { id: entityID, properties: [], events: [] };
				
				var propertyGroup = { type: "group", name: "properties", value: [
					{ type: "int", name: "Target ID", value: 122 },
					{ type: "string", name: "Target Name", value: "Player" },
					{ type: "float", name: "Target Distance", value: Math.random() * 352 },
					{ type: "group", name: "Target Info", value: [
						{ type: "float", name: "Target Radius", value: Math.random() * 5 },
						{ type: "float", name: "Target Length", value: Math.random() * 20 }
						] }
					]
				};

				var specialGroup = { type: "group", name: "special", value: [
					{ type: "string", name: "Name", value: "My Entity Name " + entityID },
					{ type: "vec3", name: "Position", value: "1, 2, 4" }
					]
				};

				entity.properties.push(propertyGroup);
				entity.properties.push(specialGroup);

				this.addProperties(frame, entity);
			}
		}
	}
}

export class RecordedData {
	propertyTable: PropertyTable;
	valueTable: ValueTable;
	propertyValueTable: PropertyValueTable;
	entityPropertyValueTable: EntityPropertyValueTable;
	frameTable: FrameTable;
	eventDescrTable: EventDescriptorTable;
	eventTable: EventTable;

	constructor() {
		this.propertyTable = new PropertyTable();
		this.valueTable = new ValueTable();
		this.propertyValueTable = new PropertyValueTable();
		this.entityPropertyValueTable = new EntityPropertyValueTable();
		this.frameTable = new FrameTable();
		this.eventTable = new EventTable();
		this.eventDescrTable = new EventDescriptorTable();
	}
	
	/* Property Data format:
	 { type: "int", name: "Target ID", value: 122 }
	 If it's a group:
	 { type: "group", name: "Target ID", value: [
		 { type: "int", name: "Target ID", value: 122 }
		]
	 }
	 Property data is always a group type, the base one. Its name is root:
	 { type: "group", name: "root", value: [...] }
	 */
	addProperties(frame: number, entity : IEntity) {
		for (let i=0; i<entity.properties.length; ++i) {
			this.addProperty(frame, entity.id, entity.properties[i], -1);
		}
	}

	addEvents(frame : number, entityID : number, eventData : any) {

	}

	getSize()
	{
		this.frameTable.entryIDs.length;
	}
	
	addProperty(frame : number, entityID : number, propertyData : IProperty, parentID : number) {
		const propertyID = this.propertyTable.registerEntry(propertyData.type, propertyData.name, parentID);
		
		// Register children if it's a group
		if (propertyData.type == "group") {
			for (let i=0; i<propertyData.value.length; i++) {
				this.addProperty(frame, entityID, propertyData.value[i], propertyID);
			}
		}
		else {
			const valueID = this.valueTable.registerEntry(propertyData.value);
			
			// Register the property-value entry
			const propValID = this.propertyValueTable.registerEntry(propertyID, valueID);
			
			// Register the entity-property-value entry
			const entityPropValID = this.entityPropertyValueTable.registerEntry(propValID, entityID);
			
			// Register the frame
			this.frameTable.registerEntry(entityPropValID, frame);
			
			//console.log(`Adding property: propertyID ${propertyID}, valueID ${valueID}, entityID: ${entityID}`);
		}
	}
	
	buildFrameData(frame : number) : IFrameData {
		let frameData : IFrameData = { entities: {} };
		let tempPropertyData : IProperty = { type: null, value: null, name: null};
		
		const entityPropValIDs =  this.frameTable.entryIDs[frame];
		
		for (let i=0; i<entityPropValIDs.length; i++) {
			const entityPropValID = entityPropValIDs[i];
			const currentEntityID = this.entityPropertyValueTable.entityIDs[entityPropValID];
			
			let entityData = frameData.entities[currentEntityID];
			
			if (!entityData)
			{
				frameData.entities[currentEntityID] = { id: 35, properties: [], events:[], groupMap: {} };
				entityData = frameData.entities[currentEntityID];
			}
			
			const propValueID = this.entityPropertyValueTable.propValueIDs[entityPropValID];
			
			const valueID = this.propertyValueTable.valueIDs[propValueID];
			const propertyID = this.propertyValueTable.propertyIDs[entityPropValID];
			
			const value = this.valueTable.values[valueID];
			const propertyName = this.propertyTable.names[propertyID];
			const propertyType = this.propertyTable.types[propertyID];
			
			const propertyParent = this.propertyTable.parentIDs[propertyID];
			
			// Create property object
			const property : IProperty = { type: propertyType, name: propertyName, value: value };
			
			tempPropertyData = property;
			
			// We need to add all the parents first
			let currentParentID = propertyParent;
			while (true) {
				
				if (currentParentID == -1) {
					entityData.properties.push(tempPropertyData);
					break;
				}
				
				if (entityData.groupMap[currentParentID]) {
					entityData.groupMap[currentParentID].value.push(tempPropertyData);
					break;
				}
				else {
					const parentName = this.propertyTable.names[currentParentID];
					tempPropertyData = { type: "group", name: parentName, value: [tempPropertyData] };
					
					entityData.groupMap[currentParentID] = tempPropertyData;
				}
				
				currentParentID = this.propertyTable.parentIDs[currentParentID];
			}
		}
		
		return frameData;
	}

	addTestData() {
		for (let i=0; i<100; ++i)
		{
			const frame = i;
			
			for (let j=0; j<15; ++j)
			{
				const entityID = j + 1;

				var entity : IEntity = { id: entityID, properties: [], events: [] };
				
				var propertyGroup = { type: "group", name: "properties", value: [
					{ type: "int", name: "Target ID", value: 122 },
					{ type: "string", name: "Target Name", value: "Player" },
					{ type: "float", name: "Target Distance", value: Math.random() * 352 },
					{ type: "group", name: "Target Info", value: [
						{ type: "float", name: "Target Radius", value: Math.random() * 5 },
						{ type: "float", name: "Target Length", value: Math.random() * 20 }
						] }
					]
				};

				var specialGroup = { type: "group", name: "special", value: [
					{ type: "string", name: "Name", value: "My Entity Name " + entityID },
					{ type: "vec3", name: "Position", value: "1, 2, 4" }
					]
				};

				entity.properties.push(propertyGroup);
				entity.properties.push(specialGroup);

				this.addProperties(frame, entity);
			}
		}
	}
}