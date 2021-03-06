from rest_framework import serializers

from app.api.models.Box import Box
from app.api.models.Given import Given
from django.db import models

from Z3StepBuilder import Z3StepBuilder
from Z3ProofBuilder import Z3ProofBuilder

from app.api.models.Proof import Proof


class Step(models.Model):
    proofId = models.ForeignKey(Proof)
    text = models.CharField(max_length=300)
    givenJust = models.ManyToManyField(Given, blank=True, null=True)
    #stepJust = models.ManyToManyField("self", blank=True, null=True)
    boxId = models.ForeignKey(Box, blank=True, null=True)
    depth = models.IntegerField(default=0)
    isFirstStepInBox = models.BooleanField(default=False)
    exist = models.BooleanField(default=False)
    forall = models.BooleanField(default=False)
    isZ3Formula = models.BooleanField(default=True)
    skipProof = models.BooleanField(default=False)

    @classmethod
    def z3_valid(cls, step, param_map, predicate_map, quantifier):
        step_builder = Z3StepBuilder(param_map, predicate_map, quantifier)
        valid, _ = step_builder.visitInput(step)
        return valid, step_builder

    @classmethod
    def proof_valid(cls, step_builder, step, givenJust, stepJust):
        proof_builder = Z3ProofBuilder(step_builder, step, givenJust, stepJust)
        return proof_builder.isValid()

    @classmethod
    def proof_sat(cls, step_builder, step, givenJust, stepJust):
        proof_builder = Z3ProofBuilder(step_builder, step, givenJust, stepJust)
        return proof_builder.isSat()

class StepSerializer(serializers.ModelSerializer):
    class Meta:
        model = Step
        extra_kwargs = {'isZ3Formula': {'default': True}} # this is due to Django bug not recognising the default value
        fields = ('id', 'proofId', 'text', 'givenJust', 'boxId', 'depth', 'isFirstStepInBox', 'exist', 'forall', 'isZ3Formula', 'skipProof')
