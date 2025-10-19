# Sketchpad

**[✨ LIVE DEMO]** (https://nikneutron1.github.io/sketchpad/)

A Sketchpad that runs on Desktops and Mobile Devices using an experimental Color Palette.

I made those components after asking myself how a Color Palette would look like that contains all colors in one picture. The Project has a 2D Color palette and and 1D Color palette. It uses Hilbert Curves to find all colors within the RGB Cube. The Repository is part of a bigger personal project I got going and is primarily serves as a show case for me a developer.

The bigger project is not on github. I have self hosted gitlab instance at home, that I'm usually working with.

The project has an embarrassingly small amount of Unit Tests. There are no tests yet, that require Mocks or a deeper setup. I will probably add some more tests in the future.

Example Unit Test Classes
  - point-2d.spec.ts tests some functions of a utility class

## RUN LOCALLY (DEV MODE)

Run `ng serve` or  `npm test` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

# RUN TESTS

Run `npm run test`.

# BUILDING AND DEPLOYMENT

There is a simple github pages deployment set up. Run `ng deploy`.

