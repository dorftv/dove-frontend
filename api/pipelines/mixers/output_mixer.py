
from pathlib import Path
from typing import Optional
from api.mixers_dtos import outputMixerDTO
from pipelines.mixers.mixer import Mixer
from .mixer import Mixer


class outputMixer(Mixer):
    data: outputMixerDTO
 
    def build(self):
        self.add_pipeline(self.get_pipeline_start() + f"x264enc ! mpegtsmux ! hlssink max-files=5 playlist-location={self.output_base.joinpath('index.m3u8')} location={self.output_base}")

    def switch_src(self, src: str):
        elm = self.inner_pipelines[0].get_by_name(f"output_{self.uid}")
        elm.set_property("listen_to", src)
        
    def describe(self):
        return self.data
