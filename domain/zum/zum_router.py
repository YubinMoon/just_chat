from typing import Annotated, Union, Optional
from fastapi import APIRouter, status
from fastapi import APIRouter, HTTPException, Body, Query, Path
from domain.zum import zum_schema
from domain.zum.calculator import cal_rate

router = APIRouter(
    prefix="/api/zum",
    tags={"Zum"},
)


@router.get(
    "/age",
    status_code=status.HTTP_200_OK,
    summary="zum years",
)
async def zum_get(
    m: int = Query(title="earth age"),
    d: int = Query(title="earth age"),
    t: int = Query(title="earth age"),
):

    result = cal_rate(m, d, t)
    return result
