from abc import ABC, abstractmethod
import functools
from gi.repository import Gst, GLib

from typing import Callable, Optional, Any

from pydantic import BaseModel


class GSTBase(BaseModel):
    inner_pipelines: list[Gst.Pipeline] = []
    @abstractmethod
    def build(self):
        pass

    def add_pipeline(self, pipeline: str | Gst.Pipeline):
        if type(pipeline) == str:
            pipeline = Gst.parse_launch(pipeline)

        self.inner_pipelines.append(pipeline)
        pipeline.set_state(Gst.State.PLAYING)

    @staticmethod
    def run_on_master():
        def inner(func: Callable):
            return functools.partial(GLib.idle_add, func)
        return inner
