import { 
  AdjacentSchema, 
  GQLBase,
  Getters,
  Setters,
  Properties,
  Schema,
  SyntaxTree,
  
  MODEL_KEY,
  
  typeOf,
  DirectTypeManager
} from '../es6/lattice'

import { parse } from 'graphql'


describe('@AdjacentSchema', () => {
  @AdjacentSchema(module)
  class Sample extends GQLBase { }
  
  it('should add a module getter', () => {
    expect(Sample.module).toEqual(module);
  })
  
  it('should add a SCHEMA property matching ADJACENT_FILE', () => {
    expect(Sample.SCHEMA).toEqual(GQLBase.ADJACENT_FILE)
  })
})

describe('@Getters', () => {
  @Schema('type Sample {test: String fun: String}')
  @Getters('test', 'fun')
  class Sample extends GQLBase { }
  
  @Schema('type Employee {name: String job: String}')
  @Getters(['name', 'firstName'], 'job')
  class Employee extends GQLBase { }
  
  @Schema('type Person {employee: Employee}')
  @Getters(['employee', '_emp', Employee])
  class Person extends GQLBase { }
  
  @Getters('broken')
  class InvalidGQLBase extends GQLBase { }
  
  const test = 'with jest'
  const fun = 'always'  
  const firstName = 'Jane'
  const job = 'Engineer'  
  const broken = 'It is just broke'
  const instance = new Sample({test, fun})
  const employee = new Employee({firstName, job})
  const person = new Person({_emp: {firstName, job}})
  const invalid = new InvalidGQLBase({broken})
  
  it('should have a getter for "test"', () => {
    expect(instance.test).toEqual(test)
    expect(() => {
      instance.test = 'Something else'
    }).toThrow();    
    expect(instance.test).toEqual(test)
  })

  it('should allow for remapping between type fields and model fields', () => {
    expect(employee.name).toEqual(firstName)
    expect(employee.job).toEqual(job);
  })
  
  it('should return an actual Employee object', () => {
    expect(typeOf(person.employee)).toEqual(Employee.name)
    expect(person.employee.name).toEqual(firstName)
  })
  
  it('should throw an error due to a missing SCHEMA', () => {
    expect(() => {
      invalid.broken
    }).toThrow()
  })
})

describe('@Setters', () => {
  @Schema('type Sample {test: String fun: String}')
  @Setters('test', 'fun')
  class Sample extends GQLBase { }
  
  @Schema('type Employee {name: String job: String}')
  @Setters(['name', 'firstName'], 'job')
  class Employee extends GQLBase { }

  @Schema('type Person {employee: Employee}')
  @Setters(['employee', '_emp', Employee])
  class Person extends GQLBase { }
  
  const test = 'with jest'
  const fun = 'always'  
  const firstName = 'Brielle'
  const job = 'Engineer'  
  const instance = new Sample({test, fun})
  const employee = new Employee({firstName, job})
  
  it('should have a setter for "test"', () => {    
    expect(() => {
      instance.test = 'Something else'
    }).not.toThrow(); 
    expect(instance.test).toBeUndefined()
  })

  it('should allow for remapping between type fields and model fields', () => {
    expect(() => {
      employee.name = 'Dorkis'
      employee.job = 'Vendor'
    }).not.toThrow()
    
    expect(employee.model.firstName).toEqual('Dorkis')
    expect(employee.model.job).toEqual('Vendor');
  })
  
  it('should not break if we create and set a complex type to null', () => {
    expect(() => {
      const emptyPerson = new Person({_emp: null})

      emptyPerson.employee = null;
    }).not.toThrow()
  })
})

describe('@Properties', () => {
  @Schema('type Sample {test: String fun: String}')
  @Properties('test', 'fun')
  class Sample extends GQLBase { }
  
  @Schema('type Employee {name: String job: String}')
  @Properties(['name', 'firstName'], 'job')
  class Employee extends GQLBase { }
  
  @Schema('type Person {employee: Employee}')
  @Properties(['employee', '_emp', Employee])
  class Person extends GQLBase { }

  @Getters('broken')
  class InvalidGQLBase extends GQLBase { }
  
  const test = 'with jest'
  const fun = 'always'
  const firstName = 'Brielle'
  const job = 'Engineer'  
  const broken = 'It is just broke'
  const instance = new Sample({test, fun})
  const employee = new Employee({firstName, job})
  const invalid = new InvalidGQLBase({broken})
  
  it('should have a setter for "test"', () => {    
    expect(instance.test).toEqual(test)
    expect(() => {
      instance.test = 'Something else'
    }).not.toThrow(); 
    expect(instance.test).not.toBeUndefined()
  })

  it('should allow for remapping between type fields and model fields', () => {
    expect(employee.name).toEqual(firstName);
    expect(employee.job).toEqual(job);
    expect(() => {
      employee.name = 'Dorkis'
      employee.job = 'Vendor'
    }).not.toThrow()
    
    expect(employee.name).toEqual('Dorkis')
    expect(employee.job).toEqual('Vendor');
  })
  
  it('should throw due to a missing SCHEMA', () => {
    expect(() => {
      invalid.broken
    }).toThrow()
  })
  
  it('should be able to create a GQL object with a null complex type', () => {
    let emptyPerson;
    
    expect(() => {
      emptyPerson = new Person({_emp: null})    
    }).not.toThrow();
    
    expect(() => {
      emptyPerson.employee = null;            
    }).not.toThrow();

    emptyPerson[MODEL_KEY]._emp = {name: 'Bubba', job: 'Monster Hunter'};
    expect(typeOf(emptyPerson.employee)).toEqual(Employee.name)  
  })
})

describe('@Schema', () => {
  const schema = `
    type Sample {
      name: String!
      id: ID
    }
  `
  
  @Schema(schema)
  class Sample extends GQLBase { }
  
  let instance = new Sample()
  
  it('should have a schema matching ours', () => {
    expect(Sample.SCHEMA).toEqual(schema);
  })
  
  it('should have a non-nullable name', () => {
    let { meta } = SyntaxTree.findField(
      parse(Sample.SCHEMA), Sample.name, 'name'
    );
    
    expect(meta.nullable).toEqual(false)
    expect(meta.type).not.toEqual(null)
  })
  
  it('should have a nullable id', () => {
    let { meta } = SyntaxTree.findField(
      parse(Sample.SCHEMA), Sample.name, 'id'
    );
    
    expect(meta.nullable).toEqual(true)
    expect(meta.type).not.toEqual(null)
  })
})

describe('DIRECT_TYPES', () => {
  @Schema('type Person { name: String }')
  @Getters(['name', String])
  class Person extends GQLBase { }
  
  const answer1 = 'Harrison, Brielle'
  const answer2 = '5'
  const answer3 = 'David'
  let peep;

  it('should allow using String to coerce an object with toString()', () => {
    peep = new Person({name: {
      get first() { return 'Brielle' },
      get last() { return 'Harrison'},
      
      toString() { return `${this.last}, ${this.first}` }
    }})
    expect(peep.name).toBe(answer1)    
  })
  
  it('should run any value for name through as a String', () => {
    peep = new Person({name: 5})
    expect(5).not.toBe(answer2);
    expect(peep.name).toBe(answer2);
  })
  
  it('should not coerce values if String is removed from DIRECT_TYPES', () => {
    DirectTypeManager.clear();
    expect(DirectTypeManager.types.length).toEqual(0);
    
    peep = new Person({name: answer3})
    expect(peep.name).not.toBe(answer3);
    expect(typeOf(peep.name)).toBe(String.name)
    expect(typeof peep.name).toBe('object')
    
    // This is due to how `new String(...)` and `String(...)` differ. The use 
    // of DIRECT_TYPES is directly related to this inconsistency.
    expect(new String(answer3)).not.toBe(answer3)
    expect(String(answer3)).toBe(answer3)
    
    DirectTypeManager.reset();
  })
})