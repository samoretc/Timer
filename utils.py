import re

def findLength(exc_arr): 
	length = 0
	for exc in exc_arr:
		if not re.search('workout', exc):
			if findPosition(exc) > length:
				length = findPosition(exc) 	
	return length + 1



def findPosition(exc):
	pos = re.search('[0-9]+', exc)
	return int(pos.group())

def is_time(exc):
	if re.search('time', exc):
		return True
	else: 
		return False

def is_rest(exc): 
	if re.search('rest', exc):
		return True
	else: 
		return False
	

def is_name(exc):  
	if re.search('name', exc):
		return True
	else: 
		return False
