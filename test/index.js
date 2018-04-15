const run = require("../src")
const vals = require("./vals")
const lib = require("./lib")

process.env.testVar = ""
const before = t => {
  process.env.testVar += "t"
  return () => {
    delete process.env.testVar
  }
}

const tests = () => ({
  vals,
  lib,

  // test possible test structure
  before: [
    {
      fn: () => true,
      before,
      expect: () => process.env.testVar === "t",
      info: "Test before function by setting process.env.testVar"
    }
  ],
  after: [
    {
      fn: async () => new Promise(r => setTimeout(r, 10)),
      expect: () => !process.env.testVar,
      info: "After should have deleted process.env.testVar"
    }
  ],
  testNestedObject: {
    nestedSingleTest: { fn: () => 1, expect: 1 },
    deeper: {
      rabbit: [
        { fn: () => 1, expect: 1 },
        { fn: () => false, expect: false },
        { fn: () => "string", expect: "string" }
      ]
    }
  },
  testNestedArray: {
    arr: [
      { fn: () => true, expect: true },
      { fn: () => false, expect: false },
      { fn: () => ({}), expect: e => typeof e === "object" }
    ]
  },
  testInvalidTests: [
    {
      fn: () => {
        try {
          return run("INVALID")
        } catch (e) {
          return e
        }
      },
      expect: e => e instanceof Error
    }
  ],
  suiteFn: { fn: () => true, expect: true },
  suiteEmpty: null
})

run(tests)
