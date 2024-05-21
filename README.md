# Chisel-Model-Training
Using brainjs to train, store, and get models
This is not a service but rather a submodule / package so other services can invoke or add-on. 
Services that invoked this package should build a thin layer of controller based on controller provided in modelTrainingController.ts.
Also a sample implementation is provided in integration test modelTrainingController.spec.ts