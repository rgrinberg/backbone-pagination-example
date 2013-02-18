from flask import Flask, Response, render_template
from random import choice, randint
import json
app = Flask(__name__)
default_amount = 10

class User(object):
    """ Dummy user model. Bare minimum to get demonstrate functionality """ 
    def __init__(self,name,age):
        self.name = name
        self.age = age
    @classmethod
    def RandomPerson(cls):
        """ Create a random person out of the following pool of first/last
        names"""
        firstnames = 'jerry tom lenny homer michael jane hannah olga'.split()
        lastnames = 'smith jones doe mcdonald stein harper'.split()
        random_name = '%s %s' % (
                choice(firstnames).capitalize(), choice(lastnames).capitalize())
        return cls(random_name, randint(15, 85))
    
    def json_encode(self):
        return { 'name' : self.name, 'age' : self.age }

def generate_cursor(users):
    """ Generate a cursor from a list of User objects """ 
    # we sometimes return an empty cursor to show that the next button isn't
    # always there
    if randint(0,1) == 0: return ''
    # This is simple (and crude) enough for us
    # random character selected form every name. a space counts as an 'x'
    first  = "".join(map(lambda u: choice(u.name), users)).replace(' ','x')
    second = str(sum(map(lambda u: u.age, users))) # sum of ages
    return first + second

def build_response(users):
    """ given a list of User objects create a response dict with a cursor """ 
    return {
        'cursor' : generate_cursor(users),
        'users' : [ u.json_encode() for u in users ],
    }

def get_users(cursor=None):
    """ fetches users. if a cursor is given then just log it but really
    do nothing"""
    if cursor is not None: app.logger.debug('Returned cached result set from: (%s)' % cursor)
    else: app.logger.debug('Returning result set without cursor')
    return [ User.RandomPerson() for _ in range(0,default_amount) ]

# show the users with some cursor. cursor is meaningless and is
# basically a random string
@app.route('/users/', defaults={'cursor' : None})
@app.route('/users/<string:cursor>')
def users(cursor):
    return Response(json.dumps(build_response(get_users(cursor))),
            mimetype='application/json')

@app.route('/')
def index(): return render_template('index.html')

if __name__ == '__main__':
    app.debug = True
    app.run()
