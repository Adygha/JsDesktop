//const IGNORED_STATIC = ['toSource', 'toString', 'apply', 'call', 'bind', 'arguments', 'caller', 'constructor', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__', 'prototype', 'length', 'name', 'classImplement', 'objectImplement', '_getProps']
//const IGNORED_INSTANCE = ['toSource', 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', '__defineGetter__', '__defineSetter__', '__lookupGetter__', '__lookupSetter__', '__proto__', 'constructor']
const IGNORED_STATIC = ['prototype', 'length', 'name']
const IGNORED_INSTANCE = ['constructor']
const REGEX_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg; // From: https://stackoverflow.com/questions/1007981/

/**
 * An attempt to make a JavaScript interface.
 */
export default class Interface {
  //constructor () {
  //  if (new.target === Interface) { // Check if an object begins to instatiate from this abstract class directly
  //    throw new TypeError('Creating an instance of \'Interface\' directly is not permitted. You must extend it (as another interface) then use its \'class-/objectImplement\' static methods.')
  //  }
  //}

  constructor () {
    throw new TypeError('Creating an instance of the interface directly is not permitted. You must use its \'class-/objectImplement\' static methods to check implementation.')
  }

  /**
   * Checks if a class implements the interface.
   * @param {ObjectConstructor} implementingClass the class to be checked
   */
  static checkClassImplements (implementingClass) {
    if (this === Interface) {
      throw new TypeError('This \'classImplement\' static method should be called from the actual extended interface.' )
    }
    let tmpReqStaticInter = this._getProps(this, true) // Required static interface
    let tmpReqInstanceInter = this._getProps(this.prototype, false) // Required instance interface
    let tmpActStaticInter = this._getProps(implementingClass, true) // Actual static interface
    let tmpActInstanceInter = this._getProps(implementingClass.prototype, false) // Actual instance interface
    tmpReqStaticInter.forEach((propParams, propName) => { // Check the static properties/methods
      if (propParams > -1 && (!tmpActStaticInter.has(propName) || implementingClass[propName].length !== propParams)) { // If incorrect/missing static method
        let tmpSig = this[propName].toString().replace(REGEX_COMMENTS, '') // Remove comments if any from method string
        tmpSig = tmpSig.slice(0, tmpSig.indexOf('{')).replace(/\s\s+/g, ' ').trim() // Get only method signature (without many spaces: https://stackoverflow.com/questions/1981349/)
        throw new Error('The static method with the signature \'' + tmpSig + '\' should be implemented in the \'' + implementingClass.name + '\' class.')
      } else if (!tmpActStaticInter.has(propName)) { // If incorrect/missing static property
        throw new Error('The static property \'' + propName + '\' should be implemented in the \'' + implementingClass.name + '\' class.')
      }
    })
    tmpReqInstanceInter.forEach((propParams, propName) => { // Check the instance properties/methods
      if (propParams > -1 && (!tmpActInstanceInter.has(propName) || implementingClass.prototype[propName].length !== propParams)) { // If incorrect/missing instance method
        let tmpSig = this.prototype[propName].toString().replace(REGEX_COMMENTS, '') // Remove comments if any from method string
        tmpSig = tmpSig.slice(0, tmpSig.indexOf('{')).replace(/\s\s+/g, ' ').trim() // Get only method signature (without many spaces: https://stackoverflow.com/questions/1981349/)
        throw new Error('The method with the signature \'' + tmpSig + '\' should be implemented in the \'' + implementingClass.name + '\' class.')
      } else if (!tmpActInstanceInter.has(propName)) { // If incorrect/missing instance property
        throw new Error('The property \'' + propName + '\' should be implemented in the \'' + implementingClass.name + '\' class.')
      }
    })
  }

  /**
   * Checks if an object implements the interface.
   * @param {Object} implementingObj  the object to be checked
   */
  static checkObjectImplements (implementingObj) {
    if (this === Interface) {
      throw new TypeError('This \'objectImplement\' static method should be called from the actual extended interface.')
    }
    let tmpReqStaticInter = this._getProps(this, true) // Required static interface
    let tmpReqInstanceInter = this._getProps(this.prototype, false) // Required instance interface
    let tmpActStaticInter = this._getProps(implementingObj.constructor, true) // Actual static interface
    let tmpActInstanceInter = this._getProps(implementingObj, false) // Actual instance interface
    tmpReqStaticInter.forEach((propParams, propName) => { // Check the static properties/methods
      if (propParams > -1 && (!tmpActStaticInter.has(propName) || implementingObj.constructor[propName].length !== propParams)) { // If incorrect/missing static method
        let tmpSig = this[propName].toString().replace(REGEX_COMMENTS, '') // Remove comments if any from method string
        tmpSig = tmpSig.slice(0, tmpSig.indexOf('{')).replace(/\s\s+/g, ' ').trim() // Get only method signature (without many spaces: https://stackoverflow.com/questions/1981349/)
        throw new Error('The static method with the signature \'' + tmpSig + '\' should be implemented in the specified object.')
      } else if (!tmpActStaticInter.has(propName)) { // If incorrect/missing static property
        throw new Error('The static property \'' + propName + '\' should be implemented in the specified object.')
      }
    })
    tmpReqInstanceInter.forEach((propParams, propName) => { // Check the instance properties/methods
      if (propParams > -1 && (!tmpActInstanceInter.has(propName) || implementingObj[propName].length !== propParams)) { // If incorrect/missing instance method
        let tmpSig = this.prototype[propName].toString().replace(REGEX_COMMENTS, '') // Remove comments if any from method string
        tmpSig = tmpSig.slice(0, tmpSig.indexOf('{')).replace(/\s\s+/g, ' ').trim() // Get only method signature (without many spaces: https://stackoverflow.com/questions/1981349/)
        throw new Error('The method with the signature \'' + tmpSig + '\' should be implemented in the specified object.')
      } else if (!tmpActInstanceInter.has(propName)) { // If incorrect/missing instance property
        throw new Error('The property \'' + propName + '\' should be implemented in the specified object.')
      }
    })
  }

  /**
   * A supposedly private static method to get the class's/object's properties/methods.
   * @param {ObjectConstructor|Object} theClassObject the class/object to be checked
   * @param {Boolean} [isStatic=false]                'true' to get the static properties, or default 'false' for non-static
   * @returns {Map<String, Number>}                   a map containing the properties'/methods' names as keys and the number of parameters as values
   * @private
   */
  static _getProps (theClassObject, isStatic = false) {
    let outMap = new Map()
    let tmpIgnoreArr = isStatic ? IGNORED_STATIC : IGNORED_INSTANCE
    while (theClassObject && theClassObject !== Interface && theClassObject !== Function.prototype && theClassObject !== Object.prototype) { // Loop throw all prototypes (except those)
      //if (theClassObject === Interface || theClassObject === Function.prototype || theClassObject === Object.prototype) {
      //  theClassObject = Object.getPrototypeOf(theClassObject)
      //  continue // Skip this prototype
      //}
      let tmpArr = Object.getOwnPropertyNames(theClassObject) // Get current prototype level property-names
      tmpArr.forEach(propName => { // Go though propery-names
        if (tmpIgnoreArr.indexOf(propName) === -1) { // If propery-name is not in the ignore list, add it
          let tmpDesc = Object.getOwnPropertyDescriptor(theClassObject, propName)
          let tmpParams = tmpDesc.value && typeof tmpDesc.value === 'function' ? tmpDesc.value.length : -1
          //outMap.set(propName, typeof theClassObject[propName] === 'function' ? theClassObject[propName].length : typeof theClassObject[propName]) // If it is a function, add the nuber of parameters
          outMap.set(propName, tmpParams) // If it is a function, add the number of parameters
        }
      })
      theClassObject = Object.getPrototypeOf(theClassObject) // Go to deeper prototype level
    }
    return outMap
  }
}
