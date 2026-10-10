from decimal import Decimal
from typing import Literal, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    model_validator,
)


class UserCreate(BaseModel):
    firstName: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    firstName: str
    email: EmailStr


class AnnonceCreate(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
    )

    parcours: str = Field(min_length=10, max_length=1000)
    description: str = Field(min_length=30, max_length=3000)

    matiere: Literal[
        "mathematiques",
        "physique-chimie",
        "anglais",
        "francais",
        "arabe",
        "informatique",
    ]

    niveau: Literal["college", "lycee", "superieur"]
    format: Literal["presentiel", "en-ligne", "both"]

    ville_id: Optional[int] = Field(
        default=None, gt=0, strict=True
    )
    quartier_id: Optional[int] = Field(
        default=None, gt=0, strict=True
    )

    tarif: Decimal = Field(
        gt=0,
        decimal_places=2,
        allow_inf_nan=False,
    )

    disponibilites: Optional[str] = Field(
        default=None, max_length=500
    )

    @model_validator(mode="after")
    def verifier_localisation(self):
        if self.format in ("presentiel", "both"):
            if self.ville_id is None or self.quartier_id is None:
                raise ValueError(
                    "La ville et le quartier sont obligatoires "
                    "pour les cours en présentiel."
                )

        if self.quartier_id is not None and self.ville_id is None:
            raise ValueError(
                "Un quartier doit être associé à une ville."
            )

        return self
