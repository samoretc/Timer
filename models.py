from google.appengine.ext import ndb 

class Workout(ndb.Model):
	title = ndb.StringProperty()

class Exercise(ndb.Model): 
	name = ndb.StringProperty()
	time = ndb.IntegerProperty()
	rest = ndb.IntegerProperty()
	workout_title = ndb.StringProperty()
	order = ndb.IntegerProperty()