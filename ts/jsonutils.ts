module silizium.jsonutils {

	export function expectProperty(name: string, type: string, json : any) : void {
		if(json[name] === undefined) {
			console.log(json);
			throw new Error("Expected property " + name);
		}

		if(typeof(json[name]) !== type) {
			console.log(json);
			throw new Error("Expected property " + name + " to be of type " + type);
		}
	}

	export function expectNumber(name: string, min : number, max : number, json : any) : void {
		expectProperty(name, 'number', json);

		if(json[name] < min || json[name] > max) {
			throw new Error("Property " + name + " should be in range " + min + " to " + max);
		}
	}

	export function expectMap(elementType : string, json : any) : void {
		if(Object.keys(json).length === 0) {
			throw new Error("Expected a map, got empty object");
		}

		for(var key in json) {
			if(typeof(json[key]) !== elementType) {
				throw new Error("Expected elements of type " + elementType+ " for " + key);
			}
		}
	}


}
