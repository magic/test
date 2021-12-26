import deep from '@magic/deep'
import is from '@magic/types'

const createLibTest = (lib, spec, fullName) => {
  if (is.array(spec)) {
    return spec.map(type => createLibTest(lib, type, fullName))
  }

  let fn = spec
  if (!is.fn(spec)) {
    fn = is[spec]
  }

  if (!is.fn(fn)) {
    return {
      fn: false,
      info: `Spec for ${fullName} is wrong, got: ${spec}, but @magic/types does not have this function.`,
    }
  }

  return {
    fn: fn(lib),
    info: `Spec for ${fullName} is wrong, expected: ${spec}, actual type is ${typeof lib}`,
  }
}

export const test = (lib = {}, spec = {}, parent = '') => {
  return Object.entries(lib)
    .map(([name, subLib]) => {
      const fullName = `${parent ? `${parent}.` : ''}${name}`
      const subSpec = spec[name]

      if (!subSpec) {
        return {
          fn: false,
          info: `Spec missing for ${fullName}`,
        }
      }

      if (is.array(subSpec)) {
        const [parentType, subSpecChildren] = subSpec
        if (subSpecChildren === false) {
          return []
        }

        const parentTest = createLibTest(subLib, parentType, fullName)
        const subTests = test(subLib, subSpecChildren, `${parent}${name}`)

        return [parentTest, ...subTests]
      } else if (is.string(subSpec)) {
        if (subSpec === 'obj' || subSpec === 'object') {
          return {
            fn: false,
            info: `Spec for ${fullName} specifies object, but no children defined. change to an array [parentType, { subName: subType }]`,
          }
        }

        return createLibTest(subLib, subSpec, fullName)
      } else if (is.function(subSpec)) {
        return createLibTest(subLib, subSpec, fullName)
      }
    })
    .filter(a => a)
}

export const version = (lib, spec, parent) => deep.flatten(test(lib, spec, parent))

export default version
