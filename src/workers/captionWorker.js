/* eslint-disable no-restricted-globals */
import {
  Florence2ForConditionalGeneration,
  AutoProcessor,
  AutoTokenizer,
  RawImage,
} from '@huggingface/transformers';

let model = null;
let tokenizer = null;
let processor = null;

self.onmessage = async (e) => {
  const { type, id, ...data } = e.data;

  try {
    if (type === 'load') {
      [model, tokenizer, processor] = await Promise.all([
        Florence2ForConditionalGeneration.from_pretrained(data.model, {
          dtype: data.dtype,
          progress_callback: (p) => self.postMessage({ type: 'progress', ...p }),
        }),
        AutoTokenizer.from_pretrained(data.model),
        AutoProcessor.from_pretrained(data.model),
      ]);
      self.postMessage({ type: 'loaded', id });
    }

    if (type === 'caption') {
      const image = await RawImage.fromURL(data.imageSource);
      const task = '<MORE_DETAILED_CAPTION>';
      const prompts = processor.construct_prompts(task);
      const textInputs = tokenizer(prompts);
      const imageInputs = await processor(image);

      const generatedIds = await model.generate({
        ...textInputs,
        ...imageInputs,
        max_new_tokens: 100,
      });

      const generatedText = tokenizer.batch_decode(generatedIds, { skip_special_tokens: false })[0];
      const result = processor.post_process_generation(generatedText, task, image.size);
      self.postMessage({ type: 'result', id, data: result[task] ?? '' });
    }
  } catch (err) {
    self.postMessage({ type: 'error', id, error: err.message });
  }
};
