import is from '@magic/types'

/** @typedef {unknown} SpecValue */

/**
 * @param {unknown} lib
 * @param {unknown | unknown[]} spec
 * @param {string} fullName
 * @returns {{ fn: boolean, info: string } | { fn: boolean, info: string }[]}
 */
const createLibTest = (lib, spec, fullName) => {
  if (is.array(spec)) {
    return spec.map(type => createLibTest(lib, type, fullName)).flat()
  }

  let fn = spec
  if (!is.fn(spec)) {
    if (is.string(spec) && is.ownProp(is, spec)) {
      const isValue = is[/** @type {keyof typeof is} */ (spec)]
      if (is.fn(isValue)) {
        fn = isValue
      }
    }
  }

  if (!is.fn(fn)) {
    return {
      fn: false,
      info: `Spec for ${fullName} is wrong, got: ${spec}, but @magic/types does not have this function.`,
    }
  }

  return {
    fn: /** @type {Function} */ (fn)(lib),
    info: `Spec for ${fullName} is wrong, expected: ${spec}, actual type is ${typeof lib}`,
  }
}

/**
 * @param {Record<string, unknown>} [lib={}]
 * @param {Record<string, SpecValue>} [spec={}]
 * @param {string} [parent='']
 * @returns {({ fn: boolean, info: string } | { fn: boolean, info: string }[])[]}
 */
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

        const parentTest = createLibTest(subLib, parentType, fullName)

        if (subSpecChildren === false) {
          return parentTest
        }

        if (is.object(subLib) && is.object(subSpecChildren)) {
          const subTests = test(
            /** @type {Record<string, unknown>} */ (subLib),
            /** @type {Record<string, SpecValue>} */ (subSpecChildren),
            `${parent}${name}`,
          )

          return [parentTest, ...subTests].flat()
        }

        return parentTest
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

      return undefined
    })
    .filter(a => !!a)
}

/**
 * @param {Record<string, unknown>} [lib]
 * @param {Record<string, SpecValue>} [spec]
 * @param {string} [parent]
 * @returns {{ fn: boolean, info: string }[]}
 */
export const version = (lib, spec, parent) => test(lib, spec, parent).flat(2000)
