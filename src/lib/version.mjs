import deep from '@magic/deep'
import is from '@magic/types'

export const test = (lib = {}, spec = {}, parent = '') => {
  return Object.entries(lib)
    .map(([name, subLib]) => {
      const fullName = `${parent ? `${parent}.` : ''}${name}`
      const subSpec = spec[name]

      if (!subSpec) {
        return [
          {
            fn: false,
            info: `Spec missing for ${fullName}`,
          },
        ]
      }

      if (is.array(subSpec)) {
        const [parentType, subSpecChildren] = subSpec

        const fn = is[parentType]

        if (!is.fn(fn)) {
          return [
            {
              fn: false,
              info: `Spec for ${fullName} is wrong, got: ${parentType}, but @magic/types does not have it.`,
            },
          ]
        }

        const subTests = test(subLib, subSpecChildren, `${parent}${name}`)

        return [
          {
            fn: fn(subLib),
            info: `Spec for ${fullName} is wrong, got ${parentType}, type is ${typeof subLib}`,
          },
          // recursive for all children missing
          ...subTests,
        ]
      } else if (is.string(subSpec)) {
        if (subSpec === 'obj' || subSpec === 'object') {
          return [
            {
              fn: false,
              info: `Spec for ${fullName} specifies object, but no children defined. change to an array [parentType, { subName: subType }]`,
            },
          ]
        }

        const fn = is[subSpec]

        if (!is.fn(fn)) {
          return [
            {
              fn: false,
              info: `Spec for ${fullName} is wrong, got: ${parentType}, but @magic/types does not have it.`,
            },
          ]
        }

        return [
          {
            fn: fn(subLib),
            info: `Spec for ${fullName} is wrong, got ${subSpec}, type is ${typeof subLib}`,
          },
        ]
      }

      console.log({ fullName, subSpec })
    })
    .filter(a => a)
}

export const version = (lib, spec, parent) => deep.flatten(test(lib, spec, parent))

export default version
