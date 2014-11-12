.. Mongify documentation master file, created by
   sphinx-quickstart on Wed Jul 23 10:46:21 2014.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to Mongify's documentation!
===================================

Mongify is a Rapid Rest API development module for Node JS.

Mongify augments Restify Node servers, adding a state-full data layer and best-practise REST schema.

Mongify uses Mongo DB (Mongoose ODM) as it's data layer.

How It Works
============

Mongify is based on self-defining routes. All you need to do is define data models for Mongoose, create instances of
Mongoose and Restify, and finally attach Mongify to the Restify server, injecting the Mongoose object as a dependency.

You may also optionally override resource definitions to handel custom data logic such as building custom DB queries.

External Reading
================

*Dependencies:*

- Restify Project: http://mcavage.me/node-restify/
- Mongoose ODM: http://mongoosejs.com/

*Schema research and recommendations for best practise REST API implementation.*

- http://www.youtube.com/watch?v=hdSrT4yjS1g
- http://www.youtube.com/watch?v=ITmcAGvfcJI
- http://www.youtube.com/watch?v=HW9wWZHWhnI
- http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api/
- http://www.restapitutorial.com/


Contents:

.. toctree::
   :maxdepth: 2



Indices and tables
==================

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`

```PHP
class TestClass {

}```
