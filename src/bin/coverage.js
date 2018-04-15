#!/usr/bin/env node

const istanbul = require('istanbul');
const instrumenter = new istanbul.Instrumenter();

const report = istanbul.Report.create('lcov')
const collector = new istanbul.Collector

console.log(Object.keys(istanbul))

const generatedCode = instrumenter.instrumentSync('function meaningOfLife() { return 42; }',
    'filename.js');

console.log({ generatedCode })

// collector.add(generatedCode)

// report.on('done', function () { console.log('done') })

// report.writeReport(collector)