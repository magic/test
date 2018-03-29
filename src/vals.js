// collection of javascript types to test anything against

const vals = {
  array: ["test"],
  true: true,
  false: false,
  truthy: "true",
  falsy: 0,
  nil: null,
  emptystr: "",
  emptyobject: {},
  emptyarray: [],
  func: () => {},
  number: 1234567890.0,
  num: 1237890,
  float: 1.1,
  int: 1,
  object: { test: "test" },
  obj: { t: "t" },
  string: "string",
  str: "str",
  email: "test@mail.mail",
  undefined: undefined,
  undef: undefined,
  date: new Date(),
  time: new Date().getTime(),
  error: new Error("test"),
  err: new Error("test"),
  rgb: { r: 1, g: 1, b: 1 },
  rgba: { r: 1, g: 1, b: 1, a: 1 },
  hex3: "#3d3",
  hex6: "#3d3d3d",
  hexa4: "#3d31",
  hexa8: "#3d3d3111",
  regexp: /test/
}

module.exports = vals
