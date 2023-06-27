export default function elementsToRender(arr, currentPage) {
  const firstIndex = currentPage * 4 - 4;
  const lastIndex = firstIndex + 4;
  return arr.slice(firstIndex, lastIndex);
}
