import graphene as g
import graphql_jwt
import form.schema as f
import core.schema as u
from django.contrib.auth import get_user_model

User = get_user_model()

class Query(u.Query, f.Query):
    pass
    
class Mutation(g.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    
    create_form = f.CreateForm.Field()
    delete_form = f.DeleteForm.Field()
    create_user = u.CreateUser.Field()
    

schema = g.Schema(query=Query, mutation=Mutation)