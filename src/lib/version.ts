import is from '@magic/types'

type SpecValue = unknown
type LibTestResult = { fn: boolean; info: string }

const createLibTest = (
  lib: unknown,
  spec: unknown | unknown[],
  fullName: string,
): LibTestResult | LibTestResult[] => {
  if (is.array(spec)) {
    return spec.map(type => createLibTest(lib, type, fullName)).flat()
  }

  let fn = spec
  if (!is.fn(spec)) {
    if (is.string(spec) && is.ownProp(is, spec)) {
      const isValue = (is as Record<string, unknown>)[spec]
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
    fn: fn(lib),
    info: `Spec for ${fullName} is wrong, expected: ${spec}, actual type is ${is.type(lib)}`,
  }
}

export const test = (
  lib: Record<string, unknown> = {},
  spec: Record<string, SpecValue> = {},
  parent: string = '',
): Array<LibTestResult | LibTestResult[]> => {
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
            subLib as Record<string, unknown>,
            subSpecChildren as Record<string, unknown>,
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

export const version = (
  lib: Record<string, unknown>,
  spec: Record<string, unknown>,
  parent: string = '',
): LibTestResult[] => test(lib, spec, parent).flat(Infinity) as LibTestResult[]
