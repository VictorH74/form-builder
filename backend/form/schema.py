import graphene as g
from .models import *
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required


class AlternativeType(DjangoObjectType):
    class Meta:
        model = Alternative


class QuestionType(DjangoObjectType):
    question_number = g.Int()
    question_text = g.String()

    class Meta:
        model = Question

    def resolve_question_number(self, info):
        return self.number

    def resolve_question_text(self, info):
        return self.statement


class FormType(DjangoObjectType):
    class Meta:
        model = Form


class Query(g.ObjectType):
    retrieve_form = g.Field(FormType, id=g.Int())
    forms = g.List(FormType)

    @login_required
    def resolve_retrieve_form(self, info, id):
        return Form.objects.get(id=id)
    
    @login_required
    def resolve_forms(self, info, **kwargs):
        return Form.objects.all().filter(created_by=info.context.user)


class FormInput(g.InputObjectType):
    title = g.String(required=True)
    questions = g.List(lambda: QuestionInput, required=True)


class QuestionInput(g.InputObjectType):
    question_text = g.String(required=True)
    question_number = g.Int(required=True)
    type = g.String(required=True)
    alternatives = g.List(lambda: AlternativeInput)


class AlternativeInput(g.InputObjectType):
    detail = g.String(required=True)
    is_correct = g.Boolean()


class CreateForm(g.Mutation):
    class Arguments:
        form_data = FormInput(required=True)

    form = g.Field(FormType)

    
    @login_required
    def mutate(self, info, form_data):
        questions_data = form_data.pop('questions')
        # TODO: ? Adicionar usuários autorizado
        form = Form.objects.create(**form_data, created_by=info.context.user)

        question_objs = []
        alternative_objs = []
        image_objs = []
        
        for question_data in questions_data:
            question_number = question_data.get('question_number')
            if Question.objects.filter(form=form, number=question_number).exists():
                raise Exception("Question number already exists for this form")

            alternatives_data = None
            if 'alternatives' in question_data:
                alternatives_data = question_data.pop('alternatives')

            images_data = None
            if 'images' in question_data:
                images_data = question_data.pop('images')

            if 'question_number' in question_data:
                question_data['number'] = question_data.pop('question_number')

            if 'question_text' in question_data:
                question_data['statement'] = question_data.pop('question_text')
                
            question = Question(form=form, **question_data)
            
            question_objs.append(question)

            if alternatives_data:
                for alternative in alternatives_data:
                    alternative_objs.append(Alternative(question=question, **alternative))

            if images_data:
                for image in images_data:
                    image_objs.append(Image(question=question, **image))

        Question.objects.bulk_create(question_objs)
        Alternative.objects.bulk_create(alternative_objs)
        Image.objects.bulk_create(image_objs)
        
        return CreateForm(form=form)
    
class DeleteForm(g.Mutation):
    class Arguments:
        id = g.ID(required=True)

    success = g.Boolean()

    @login_required
    def mutate(self, info, id):
        try:
            form = Form.objects.get(pk=id)
        except Form.DoesNotExist:
            raise Exception('Form not found.')
        
        user = info.context.user
        if form.created_by != user:
            raise Exception('you do not have permission to delete this form')
        
        form.delete()
        
        return DeleteForm(success=True)
