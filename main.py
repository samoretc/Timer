#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import logging
import os 
import json
import cgi 
from google.appengine.ext import ndb
import jinja2
import webapp2
import utils as utils


from models import Exercise, Workout

jinja_env = jinja2.Environment(
	loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
	autoescape=True)

#Generic key to serve as parent
PARENT_KEY = ndb.Key("Entity", "workout_root")

class MainWorkoutPage(webapp2.RequestHandler):
	def get(self):
		workouts_query = Workout.query(ancestor = PARENT_KEY)
		exercise_query = Exercise.query(ancestor = PARENT_KEY).order( Exercise.order )
		template = jinja_env.get_template("templates/index.html")
		print 'self response'
		print self.response
		self.response.write(template.render( {"workouts_query": workouts_query, "exercise_query" : exercise_query} ))

class InsertWorkoutAction(webapp2.RequestHandler):
	def post(self):
		workout_title = self.request.get("workout")
		new_workout = Workout(parent = PARENT_KEY, title = workout_title)
		new_workout.put()
		arguments = self.request.arguments()
		exercises = [ {} for i in range( utils.findLength(arguments) ) ]
		print exercises
		for argu in arguments:
			if str(argu) != 'workout':
				num = utils.findPosition(argu)
				if utils.is_time(argu):
					exercises[num]['time'] = int(self.request.get(argu))
				if utils.is_rest(argu):
					exercises[num]['rest'] = int(self.request.get(argu))
				if utils.is_name(argu): 
					exercises[num]['name'] = str(self.request.get(argu))
		print exercises
		for counter, exercise in enumerate(exercises): ## Needs to be ordered
			print counter
			print exercise
			new_exercise = Exercise(parent = PARENT_KEY, 
									name = exercise['name'],
									time = exercise['time'],
									rest = exercise['rest'],
									workout_title =  workout_title,
									order =  counter)
			new_exercise.put()

		self.redirect('/home') 

class PostBegin(webapp2.RequestHandler):
	def get(self):
		template = jinja_env.get_template("templates/workout.html")
		self.response.write(template.render( {} ))
		self.response.clear
		self.response.headers['Content-Type'] = 'text/plain'
		self.response.out.write("ted")

class DeleteWorkoutAction(webapp2.RequestHandler):
	def post(self):
		workout_name = self.request.get("workout_name")
		self.redirect('/home') 


app = webapp2.WSGIApplication([
		('/', MainWorkoutPage),
		('/home', MainWorkoutPage),
		('/insertworkout', InsertWorkoutAction),
		('/delete', DeleteWorkoutAction),
		# ('/getData', GetDataAction),
		('/workout', PostBegin)
], debug=True)
